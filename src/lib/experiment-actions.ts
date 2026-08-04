"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { AttentionState, FinalDecision } from "@prisma/client";

export async function createExperiment(data: {
  title: string;
  decisionGoal: string;
  nextCommitment: string;
  criticalAssumption: string;
  testMethod: string;
  observableEvidence: string;
  budget: string;
  decisionDate: string;
  intentId?: string;
  explorationId?: string;
}) {
  const experiment = await prisma.experiment.create({
    data: {
      title: data.title,
      decisionGoal: data.decisionGoal,
      nextCommitment: data.nextCommitment,
      criticalAssumption: data.criticalAssumption,
      testMethod: data.testMethod,
      observableEvidence: data.observableEvidence,
      budget: data.budget,
      decisionDate: new Date(data.decisionDate),
      intentId: data.intentId || null,
      explorationId: data.explorationId || null,
      state: "INBOX",
    },
  });
  revalidatePath("/experiments");
  redirect(`/experiments/${experiment.id}`);
}

export async function updateExperimentState(id: string, state: AttentionState, reason?: string) {
  const current = await prisma.experiment.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.experiment.update({ where: { id }, data: { state } }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "EXPERIMENT", toType: "EXPERIMENT",
        fromState: current.state, toState: state,
        reason: reason || `Experiment state: ${current.state} → ${state}`,
      },
    }),
  ]);
  revalidatePath(`/experiments/${id}`);
}

export async function setExperimentDecision(
  id: string,
  decision: FinalDecision,
  reasoning: string
) {
  const current = await prisma.experiment.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.experiment.update({
      where: { id },
      data: { finalDecision: decision, finalReasoning: reasoning, state: "CLOSED" },
    }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "EXPERIMENT", toType: "EXPERIMENT",
        fromState: current.state, toState: "CLOSED",
        reason: `Decision: ${decision} — ${reasoning}`,
      },
    }),
  ]);
  revalidatePath(`/experiments/${id}`);
  revalidatePath("/experiments");
}

export async function getExperiments(state?: AttentionState) {
  return prisma.experiment.findMany({
    where: state ? { state } : undefined,
    orderBy: { decisionDate: "asc" },
    include: { intent: true, exploration: true, projectCandidates: true },
  });
}

export async function getExperiment(id: string) {
  const experiment = await prisma.experiment.findUnique({
    where: { id },
    include: { intent: true, exploration: true, projectCandidates: true },
  });
  if (!experiment) return null;
  const transitionsTo = await prisma.transition.findMany({
    where: { OR: [{ toEntityId: id }, { fromEntityId: id }] },
    orderBy: { date: "desc" },
  });
  return { ...experiment, transitionsTo };
}

export async function deleteExperiment(id: string) {
  await prisma.experiment.delete({ where: { id } });
  revalidatePath("/experiments");
  redirect("/experiments");
}
