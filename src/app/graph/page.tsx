import { prisma } from "@/lib/db";
import GraphView from "@/components/GraphView";
import type { EntityType } from "@prisma/client";

export const dynamic = "force-dynamic";

export default async function GraphPage() {
  const [signals, intents, explorations, experiments, candidates, projects] =
    await Promise.all([
      prisma.signal.findMany({ select: { id: true, title: true, state: true } }),
      prisma.intent.findMany({ select: { id: true, title: true, state: true, signalId: true } }),
      prisma.exploration.findMany({ select: { id: true, title: true, state: true, signalId: true, intentId: true } }),
      prisma.experiment.findMany({
        select: { id: true, title: true, state: true, intentId: true, explorationId: true },
      }),
      prisma.projectCandidate.findMany({ select: { id: true, title: true, state: true, experimentId: true } }),
      prisma.activeProject.findMany({
        select: { id: true, title: true, state: true, projectCandidateId: true },
      }),
    ]);

  const nodes = [
    ...signals.map((s) => ({
      id: s.id,
      title: s.title,
      type: "SIGNAL" as EntityType,
      state: s.state,
      link: `/signals/${s.id}`,
    })),
    ...intents.map((i) => ({
      id: i.id,
      title: i.title,
      type: "INTENT" as EntityType,
      state: i.state,
      link: `/intents/${i.id}`,
    })),
    ...explorations.map((e) => ({
      id: e.id,
      title: e.title,
      type: "EXPLORATION" as EntityType,
      state: e.state,
      link: `/explorations/${e.id}`,
    })),
    ...experiments.map((e) => ({
      id: e.id,
      title: e.title,
      type: "EXPERIMENT" as EntityType,
      state: e.state,
      link: `/experiments/${e.id}`,
    })),
    ...candidates.map((c) => ({
      id: c.id,
      title: c.title,
      type: "PROJECT_CANDIDATE" as EntityType,
      state: c.state,
      link: `/candidates/${c.id}`,
    })),
    ...projects.map((p) => ({
      id: p.id,
      title: p.title,
      type: "ACTIVE_PROJECT" as EntityType,
      state: p.state,
      link: `/projects/${p.id}`,
    })),
  ];

  const edges = [
    ...intents.map((i) => ({
      id: `e-${i.signalId}-${i.id}`,
      source: i.signalId,
      target: i.id,
      label: "intent",
    })),
    ...explorations
      .filter((e) => e.signalId)
      .map((e) => ({
        id: `e-${e.signalId}-${e.id}`,
        source: e.signalId!,
        target: e.id,
        label: "exploration",
      })),
    ...explorations
      .filter((e) => e.intentId)
      .map((e) => ({
        id: `e-${e.intentId}-${e.id}`,
        source: e.intentId!,
        target: e.id,
        label: "exploration",
      })),
    ...experiments
      .filter((e) => e.intentId)
      .map((e) => ({
        id: `e-${e.intentId}-${e.id}`,
        source: e.intentId!,
        target: e.id,
        label: "experiment",
      })),
    ...experiments
      .filter((e) => e.explorationId)
      .map((e) => ({
        id: `e-${e.explorationId}-${e.id}`,
        source: e.explorationId!,
        target: e.id,
        label: "experiment",
      })),
    ...candidates
      .filter((c) => c.experimentId)
      .map((c) => ({
        id: `e-${c.experimentId}-${c.id}`,
        source: c.experimentId!,
        target: c.id,
        label: "candidate",
      })),
    ...projects
      .filter((p) => p.projectCandidateId)
      .map((p) => ({
        id: `e-${p.projectCandidateId}-${p.id}`,
        source: p.projectCandidateId!,
        target: p.id,
        label: "activated",
      })),
  ];

  return (
    <div className="-mx-6 -my-8 h-full space-y-0">
      <div className="border-b border-gray-200 bg-white px-6 py-4">
        <h1 className="text-2xl font-bold">Relationship Graph</h1>
        <p className="mt-1 text-sm text-gray-500">
          The full signal-to-commitment graph. Drag to pan, scroll to zoom.
        </p>
      </div>
      <GraphView nodes={nodes} edges={edges} />
    </div>
  );
}
