"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { AttentionState } from "@prisma/client";

export async function createIntent(data: {
  title: string;
  approach: string;
  expectedChange: string;
  assumption: string;
  signalId: string;
}) {
  const intent = await prisma.intent.create({
    data: {
      title: data.title,
      approach: data.approach,
      expectedChange: data.expectedChange,
      assumption: data.assumption,
      signalId: data.signalId,
      state: "INBOX",
    },
  });
  revalidatePath(`/signals/${data.signalId}`);
  redirect(`/intents/${intent.id}`);
}

export async function updateIntentState(id: string, state: AttentionState, reason?: string) {
  const current = await prisma.intent.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.intent.update({ where: { id }, data: { state } }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "INTENT", toType: "INTENT",
        fromState: current.state, toState: state,
        reason: reason || `Intent state: ${current.state} → ${state}`,
      },
    }),
  ]);
  revalidatePath(`/intents/${id}`);
}

export async function getIntents(state?: AttentionState) {
  return prisma.intent.findMany({
    where: state ? { state } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { signal: true, experiments: true },
  });
}

export async function getIntent(id: string) {
  const intent = await prisma.intent.findUnique({
    where: { id },
    include: { signal: true, explorations: true, experiments: true },
  });
  if (!intent) return null;
  const transitionsTo = await prisma.transition.findMany({
    where: { OR: [{ toEntityId: id }, { fromEntityId: id }] },
    orderBy: { date: "desc" },
  });
  return { ...intent, transitionsTo };
}

export async function deleteIntent(id: string) {
  await prisma.intent.delete({ where: { id } });
  revalidatePath("/intents");
  redirect("/intents");
}
