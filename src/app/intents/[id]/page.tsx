import { getIntent, updateIntentState } from "@/lib/intent-actions";
import { StateBadge, EntityTypeBadge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { FlaskConical, Search, Plus, Zap } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IntentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const intent = await getIntent(id);
  if (!intent) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type="INTENT" />
            <StateBadge state={intent.state} />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{intent.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            From signal: <Link href={`/signals/${intent.signalId}`} className="text-blue-600 hover:underline">{intent.signal.title}</Link>
          </p>
        </div>
        <div className="flex items-center gap-2">
          {intent.state === "INBOX" && (
            <>
              <StateButton action={updateIntentState.bind(null, id, "ACTIVE")} label="Activate" />
              <StateButton action={updateIntentState.bind(null, id, "DORMANT")} label="Dormant" variant="purple" />
              <StateButton action={updateIntentState.bind(null, id, "CLOSED")} label="Reject" variant="gray" />
            </>
          )}
          {intent.state === "ACTIVE" && (
            <>
              <StateButton action={updateIntentState.bind(null, id, "DORMANT")} label="Dormant" variant="purple" />
              <StateButton action={updateIntentState.bind(null, id, "CLOSED")} label="Close" variant="gray" />
            </>
          )}
          {intent.state === "DORMANT" && (
            <>
              <StateButton action={updateIntentState.bind(null, id, "ACTIVE")} label="Reactivate" />
              <StateButton action={updateIntentState.bind(null, id, "CLOSED")} label="Archive" variant="gray" />
            </>
          )}
        </div>
      </div>

      {/* Intent statement */}
      <div className="rounded-lg border border-violet-200 bg-violet-50 p-4">
        <p className="text-sm text-violet-800">
          By trying <span className="font-semibold">{intent.approach}</span>, I expect{" "}
          <span className="font-semibold">{intent.expectedChange}</span>, because I believe{" "}
          <span className="font-semibold">{intent.assumption}</span>.
        </p>
      </div>

      {/* Explorations */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Explorations</h2>
          <Link
            href={`/explorations/new?intentId=${intent.id}&signalId=${intent.signalId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            Add Exploration
          </Link>
        </div>
        {intent.explorations.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No explorations yet. Use when the approach needs further investigation.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {intent.explorations.map((exp) => (
              <Link
                key={exp.id}
                href={`/explorations/${exp.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-amber-500" />
                  <span className="text-sm font-medium text-gray-900">{exp.title}</span>
                  <StateBadge state={exp.state} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Experiments */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Experiments</h2>
          <Link
            href={`/experiments/new?intentId=${intent.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            Add Experiment
          </Link>
        </div>
        {intent.experiments.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No experiments yet. Use when the assumption is clear enough to test.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {intent.experiments.map((exp) => (
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

      {intent.transitionsTo.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {intent.transitionsTo.map((t) => (
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

function StateButton({
  action,
  label,
  variant = "green",
}: {
  action: () => Promise<void>;
  label: string;
  variant?: "green" | "purple" | "gray";
}) {
  const colors = {
    green: "bg-green-600 text-white hover:bg-green-700",
    purple: "bg-purple-600 text-white hover:bg-purple-700",
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
