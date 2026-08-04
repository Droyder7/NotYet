"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { AttentionState, ProjectSlot } from "@prisma/client";

export async function createActiveProject(data: {
  title: string;
  desiredOutcome: string;
  acceptanceCriteria: string;
  primaryAlignment: string;
  deadline: string;
  realisticLeadTime: string;
  currentMilestone: string;
  nextConcreteAction: string;
  majorDependency?: string;
  projectSlot: ProjectSlot;
}) {
  const project = await prisma.activeProject.create({
    data: {
      title: data.title,
      desiredOutcome: data.desiredOutcome,
      acceptanceCriteria: data.acceptanceCriteria,
      primaryAlignment: data.primaryAlignment,
      deadline: new Date(data.deadline),
      realisticLeadTime: data.realisticLeadTime,
      currentMilestone: data.currentMilestone,
      nextConcreteAction: data.nextConcreteAction,
      majorDependency: data.majorDependency || null,
      projectSlot: data.projectSlot,
      state: "ACTIVE",
    },
  });
  revalidatePath("/projects");
  redirect(`/projects/${project.id}`);
}

export async function updateProjectState(id: string, state: AttentionState, reason?: string) {
  const current = await prisma.activeProject.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.activeProject.update({ where: { id }, data: { state } }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "ACTIVE_PROJECT", toType: "ACTIVE_PROJECT",
        fromState: current.state, toState: state,
        reason: reason || `Project state: ${current.state} → ${state}`,
      },
    }),
  ]);
  revalidatePath(`/projects/${id}`);
}

export async function getProjects(state?: AttentionState) {
  return prisma.activeProject.findMany({
    where: state ? { state } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { projectCandidate: true },
  });
}

export async function getProject(id: string) {
  const project = await prisma.activeProject.findUnique({
    where: { id },
    include: { projectCandidate: true },
  });
  if (!project) return null;
  const transitionsTo = await prisma.transition.findMany({
    where: { OR: [{ toEntityId: id }, { fromEntityId: id }] },
    orderBy: { date: "desc" },
  });
  return { ...project, transitionsTo };
}

export async function deleteProject(id: string) {
  await prisma.activeProject.delete({ where: { id } });
  revalidatePath("/projects");
  redirect("/projects");
}
