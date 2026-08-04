import { prisma } from "@/lib/db";
import { Card } from "@/components/Card";
import { DemoBanner } from "@/components/DemoBanner";
import { getDataCounts } from "@/lib/demo-data";
import { WIP_LIMITS, STATE_LABELS } from "@/lib/types";
import { Zap, Lightbulb, Search, FlaskConical, ClipboardList, Rocket } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function Dashboard() {
  const [
    inboxSignals,
    activeSignals,
    activeIntents,
    activeExplorations,
    activeExperiments,
    candidates,
    activeProjects,
  ] = await Promise.all([
    prisma.signal.count({ where: { state: "INBOX" } }),
    prisma.signal.count({ where: { state: "ACTIVE" } }),
    prisma.intent.count({ where: { state: "ACTIVE" } }),
    prisma.exploration.count({ where: { state: "ACTIVE" } }),
    prisma.experiment.count({ where: { state: "ACTIVE" } }),
    prisma.projectCandidate.count({ where: { state: { not: "CLOSED" } } }),
    prisma.activeProject.findMany({
      where: { state: "ACTIVE" },
      include: { projectCandidate: true },
    }),
  ]);

  const recentSignals = await prisma.signal.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  const upcomingExperiments = await prisma.experiment.findMany({
    where: { state: "ACTIVE" },
    orderBy: { decisionDate: "asc" },
    take: 3,
  });

  const counts = await getDataCounts();
  const totalEntities =
    counts.signals + counts.intents + counts.explorations +
    counts.experiments + counts.candidates + counts.projects;
  const isEmpty = totalEntities === 0;
  const hasDemoData = totalEntities > 0;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          NotYet — attention is finite. Capture cheaply, commit slowly.
        </p>
      </div>

      <DemoBanner isEmpty={isEmpty} hasDemoData={hasDemoData} />

      {/* WIP Limits */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <WipCard
          label="Active Explorations"
          current={activeExplorations}
          limit={WIP_LIMITS.activeExplorations}
          icon={<Search className="h-5 w-5 text-amber-500" />}
        />
        <WipCard
          label="Active Experiments"
          current={activeExperiments}
          limit={WIP_LIMITS.activeExperiments}
          icon={<FlaskConical className="h-5 w-5 text-red-500" />}
        />
        <WipCard
          label="Major Projects"
          current={activeProjects.filter((p) => p.projectSlot === "MAJOR").length}
          limit={WIP_LIMITS.activeMajorProjects}
          icon={<Rocket className="h-5 w-5 text-green-600" />}
        />
        <WipCard
          label="Minor Projects"
          current={activeProjects.filter((p) => p.projectSlot === "MINOR").length}
          limit={WIP_LIMITS.activeMinorProjects}
          icon={<Rocket className="h-5 w-5 text-green-400" />}
        />
      </div>

      {/* Counts grid */}
      <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
        <CountCard label="Signals" count={inboxSignals + activeSignals} icon={<Zap className="h-5 w-5 text-blue-500" />} />
        <CountCard label="Intents" count={activeIntents} icon={<Lightbulb className="h-5 w-5 text-violet-500" />} />
        <CountCard label="Explorations" count={activeExplorations} icon={<Search className="h-5 w-5 text-amber-500" />} />
        <CountCard label="Experiments" count={activeExperiments} icon={<FlaskConical className="h-5 w-5 text-red-500" />} />
        <CountCard label="Candidates" count={candidates} icon={<ClipboardList className="h-5 w-5 text-cyan-500" />} />
        <CountCard label="Projects" count={activeProjects.length} icon={<Rocket className="h-5 w-5 text-green-600" />} />
      </div>

      {/* Upcoming experiment decisions */}
      {upcomingExperiments.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Upcoming Decisions</h2>
          <div className="mt-3 space-y-2">
            {upcomingExperiments.map((exp) => (
              <Card
                key={exp.id}
                id={exp.id}
                title={exp.title}
                type="EXPERIMENT"
                state={exp.state}
                href={`/experiments/${exp.id}`}
                summary={`Decision: ${exp.decisionGoal.slice(0, 100)}...`}
                date={exp.decisionDate.toLocaleDateString()}
              />
            ))}
          </div>
        </section>
      )}

      {/* Recent signals */}
      {recentSignals.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Recent Signals</h2>
          <div className="mt-3 space-y-2">
            {recentSignals.map((signal) => (
              <Card
                key={signal.id}
                id={signal.id}
                title={signal.title}
                type="SIGNAL"
                state={signal.state}
                href={`/signals/${signal.id}`}
                summary={signal.body.slice(0, 120)}
                date={signal.createdAt.toLocaleDateString()}
              />
            ))}
          </div>
        </section>
      )}

      {/* Active projects */}
      {activeProjects.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold">Active Projects</h2>
          <div className="mt-3 space-y-2">
            {activeProjects.map((project) => (
              <Card
                key={project.id}
                id={project.id}
                title={project.title}
                type="ACTIVE_PROJECT"
                state={project.state}
                href={`/projects/${project.id}`}
                summary={`Next: ${project.nextConcreteAction}`}
                date={project.deadline.toLocaleDateString()}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function WipCard({
  label,
  current,
  limit,
  icon,
}: {
  label: string;
  current: number;
  limit: number;
  icon: React.ReactNode;
}) {
  const over = current > limit;
  const atLimit = current === limit;
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="mt-2 flex items-baseline gap-1">
        <span
          className={`text-2xl font-bold ${over ? "text-red-600" : atLimit ? "text-amber-600" : "text-gray-900"}`}
        >
          {current}
        </span>
        <span className="text-sm text-gray-400">/ {limit}</span>
      </div>
      {over && <p className="mt-1 text-xs text-red-600">Over limit!</p>}
    </div>
  );
}

function CountCard({
  label,
  count,
  icon,
}: {
  label: string;
  count: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-4">
      <div className="flex items-center gap-2">
        {icon}
        <span className="text-sm font-medium text-gray-600">{label}</span>
      </div>
      <div className="mt-1 text-2xl font-bold text-gray-900">{count}</div>
    </div>
  );
}
