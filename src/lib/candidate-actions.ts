"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { AttentionState, WorthyReadyNow } from "@prisma/client";

export async function createProjectCandidate(data: {
  title: string;
  proposedOutcome: string;
  evidenceOfValue: string;
  primaryAlignment: string;
  acceptanceCriteria: string;
  constraints: string;
  roughEstimate: string;
  experimentId?: string;
}) {
  const candidate = await prisma.projectCandidate.create({
    data: {
      title: data.title,
      proposedOutcome: data.proposedOutcome,
      evidenceOfValue: data.evidenceOfValue,
      primaryAlignment: data.primaryAlignment,
      acceptanceCriteria: data.acceptanceCriteria,
      constraints: data.constraints,
      roughEstimate: data.roughEstimate,
      experimentId: data.experimentId || null,
      state: "INBOX",
    },
  });
  revalidatePath("/candidates");
  redirect(`/candidates/${candidate.id}`);
}

export async function updateCandidateAssessment(
  id: string,
  field: "worthy" | "ready" | "now",
  value: WorthyReadyNow,
  reason: string
) {
  await prisma.projectCandidate.update({
    where: { id },
    data: { [field]: value, [`${field}Reason`]: reason } as any,
  });
  revalidatePath(`/candidates/${id}`);
}

export async function updateCandidateState(id: string, state: AttentionState, reason?: string) {
  const current = await prisma.projectCandidate.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.projectCandidate.update({ where: { id }, data: { state } }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "PROJECT_CANDIDATE", toType: "PROJECT_CANDIDATE",
        fromState: current.state, toState: state,
        reason: reason || `Candidate state: ${current.state} → ${state}`,
      },
    }),
  ]);
  revalidatePath(`/candidates/${id}`);
}

export async function activateCandidate(id: string) {
  const candidate = await prisma.projectCandidate.findUnique({ where: { id } });
  if (!candidate) throw new Error("Candidate not found");

  const project = await prisma.activeProject.create({
    data: {
      title: candidate.title,
      desiredOutcome: candidate.proposedOutcome,
      acceptanceCriteria: candidate.acceptanceCriteria,
      primaryAlignment: candidate.primaryAlignment,
      deadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days default
      realisticLeadTime: candidate.roughEstimate,
      currentMilestone: "Initial milestone",
      nextConcreteAction: "Define first milestone",
      majorDependency: candidate.constraints || null,
      projectSlot: "MAJOR",
      projectCandidateId: id,
      state: "ACTIVE",
    },
  });

  await prisma.projectCandidate.update({
    where: { id },
    data: { state: "CLOSED" },
  });

  await prisma.transition.create({
    data: {
      fromEntityId: id,
      toEntityId: project.id,
      fromType: "PROJECT_CANDIDATE",
      toType: "ACTIVE_PROJECT",
      fromState: "INBOX",
      toState: "ACTIVE",
      reason: "Passed Worthy/Ready/Now assessment",
    },
  });

  revalidatePath("/candidates");
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function getCandidates(state?: AttentionState) {
  return prisma.projectCandidate.findMany({
    where: state ? { state } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { experiment: true, activeProject: true },
  });
}

export async function getCandidate(id: string) {
  const candidate = await prisma.projectCandidate.findUnique({
    where: { id },
    include: { experiment: true, activeProject: true },
  });
  if (!candidate) return null;
  const transitionsTo = await prisma.transition.findMany({
    where: { OR: [{ toEntityId: id }, { fromEntityId: id }] },
    orderBy: { date: "desc" },
  });
  return { ...candidate, transitionsTo };
}

export async function deleteCandidate(id: string) {
  await prisma.projectCandidate.delete({ where: { id } });
  revalidatePath("/candidates");
  redirect("/candidates");
}
