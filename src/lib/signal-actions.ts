"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "./db";
import type { AttentionState } from "@prisma/client";

export async function createSignal(data: {
  title: string;
  body: string;
  context?: string;
}) {
  const signal = await prisma.signal.create({
    data: {
      title: data.title,
      body: data.body,
      context: data.context || null,
      state: "INBOX",
    },
  });
  revalidatePath("/signals");
  redirect(`/signals/${signal.id}`);
}

export async function updateSignalState(id: string, state: AttentionState, reason?: string) {
  const current = await prisma.signal.findUniqueOrThrow({ where: { id } });
  await prisma.$transaction([
    prisma.signal.update({ where: { id }, data: { state } }),
    prisma.transition.create({
      data: {
        fromEntityId: id, toEntityId: id,
        fromType: "SIGNAL", toType: "SIGNAL",
        fromState: current.state, toState: state,
        reason: reason || `Signal state: ${current.state} → ${state}`,
      },
    }),
  ]);
  revalidatePath(`/signals/${id}`);
  revalidatePath("/signals");
}

export async function getSignals(state?: AttentionState) {
  return prisma.signal.findMany({
    where: state ? { state } : undefined,
    orderBy: { updatedAt: "desc" },
    include: { intents: true, explorations: true },
  });
}

export async function getSignal(id: string) {
  const signal = await prisma.signal.findUnique({
    where: { id },
    include: { intents: true, explorations: true },
  });
  if (!signal) return null;
  const transitionsTo = await prisma.transition.findMany({
    where: { OR: [{ toEntityId: id }, { fromEntityId: id }] },
    orderBy: { date: "desc" },
  });
  return { ...signal, transitionsTo };
}

export async function deleteSignal(id: string) {
  await prisma.signal.delete({ where: { id } });
  revalidatePath("/signals");
  redirect("/signals");
}
