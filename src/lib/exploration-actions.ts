"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { AttentionState } from "@prisma/client";

export async function createExploration(data: {
  title: string;
  unclearWhat: string;
  scope: string;
  budget: string;
  endDate: string;
  stoppingCondition: string;
  expectedOutput: string;
  signalId?: string;
  intentId?: string;
}) {
  const exploration = await prisma.exploration.create({
    data: {
      title: data.title,
      unclearWhat: data.unclearWhat,
      scope: data.scope,
      budget: data.budget,
      endDate: new Date(data.endDate),
      stoppingCondition: data.stoppingCondition,
      expectedOutput: data.expectedOutput,
      signalId: data.signalId || null,
      intentId: data.intentId || null,
      state: "INBOX",
    },
  });
  revalidatePath("/explorations");
  redirect(`/explorations/${exploration.id}`);
}

export async function updateExplorationState(id: string, state: AttentionState, reason?: string) {
  const current = await prisma.exploration.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.exploration.update({ where: { id }, data: { state } }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "EXPLORATION", toType: "EXPLORATION",
        fromState: current.state, toState: state,
        reason: reason || `Exploration state: ${current.state} → ${state}`,
      },
    }),
  ]);
  revalidatePath(`/explorations/${id}`);
}

export async function getExplorations(state?: AttentionState) {
  return prisma.exploration.findMany({
    where: state ? { state } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { signal: true, intent: true, experiments: true },
  });
}

export async function getExploration(id: string) {
  const exploration = await prisma.exploration.findUnique({
    where: { id },
    include: { signal: true, intent: true, experiments: true },
  });
  if (!exploration) return null;
  const transitionsTo = await prisma.transition.findMany({
    where: { OR: [{ toEntityId: id }, { fromEntityId: id }] },
    orderBy: { date: "desc" },
  });
  return { ...exploration, transitionsTo };
}

export async function deleteExploration(id: string) {
  await prisma.exploration.delete({ where: { id } });
  revalidatePath("/explorations");
  redirect("/explorations");
}
