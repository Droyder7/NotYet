import { getExploration, updateExplorationState } from "@/lib/exploration-actions";
import { StateBadge, EntityTypeBadge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExplorationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const exploration = await getExploration(id);
  if (!exploration) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type="EXPLORATION" />
            <StateBadge state={exploration.state} />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{exploration.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Budget: {exploration.budget} | End: {exploration.endDate.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {exploration.state === "INBOX" && (
            <>
              <StateButton action={updateExplorationState.bind(null, id, "ACTIVE")} label="Start" />
              <StateButton action={updateExplorationState.bind(null, id, "CLOSED")} label="Close" variant="gray" />
            </>
          )}
          {exploration.state === "ACTIVE" && (
            <>
              <StateButton action={updateExplorationState.bind(null, id, "WAITING")} label="Waiting" variant="amber" />
              <StateButton action={updateExplorationState.bind(null, id, "CLOSED")} label="Complete" variant="gray" />
            </>
          )}
          {exploration.state === "WAITING" && (
            <>
              <StateButton action={updateExplorationState.bind(null, id, "ACTIVE")} label="Resume" />
              <StateButton action={updateExplorationState.bind(null, id, "CLOSED")} label="Close" variant="gray" />
            </>
          )}
          {exploration.state === "CLOSED" && (
            <StateButton action={updateExplorationState.bind(null, id, "ACTIVE")} label="Re-open" />
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="What is unclear" value={exploration.unclearWhat} />
          <DetailItem label="Scope" value={exploration.scope} />
          <DetailItem label="Budget" value={exploration.budget} />
          <DetailItem label="Stopping Condition" value={exploration.stoppingCondition} />
          <DetailItem label="Expected Output" value={exploration.expectedOutput} />
          {exploration.signal && (
            <DetailItem label="Source Signal" value={exploration.signal.title} />
          )}
          {exploration.intent && (
            <DetailItem label="Source Intent" value={exploration.intent.title} />
          )}
        </dl>
      </div>

      {/* Experiments from this exploration */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Experiments</h2>
          <Link
            href={`/experiments/new?explorationId=${exploration.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            New Experiment
          </Link>
        </div>
        {exploration.experiments.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No experiments yet. A successful exploration should produce a testable assumption or experiment.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {exploration.experiments.map((exp) => (
              <Link
                key={exp.id}
                href={`/experiments/${exp.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <FlaskConical className="h-4 w-4 text-red-500" />
                  <span className="text-sm font-medium text-gray-900">{exp.title}</span>
                  <StateBadge state={exp.state} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {exploration.transitionsTo.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {exploration.transitionsTo.map((t) => (
              <div key={t.id} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm text-gray-900">{t.reason}</p>
                <p className="mt-1 text-xs text-gray-400">{t.date.toLocaleDateString()}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{label}</dt>
      <dd className="mt-1 text-sm text-gray-900">{value}</dd>
    </div>
  );
}

function StateButton({
  action,
  label,
  variant = "green",
}: {
  action: () => Promise<void>;
  label: string;
  variant?: "green" | "amber" | "gray";
}) {
  const colors = {
    green: "bg-green-600 text-white hover:bg-green-700",
    amber: "bg-amber-600 text-white hover:bg-amber-700",
    gray: "bg-gray-600 text-white hover:bg-gray-700",
  };
  return (
    <form action={action}>
      <button type="submit" className={`rounded-md px-3 py-1.5 text-xs font-medium ${colors[variant]}`}>
        {label}
      </button>
    </form>
  );
}
