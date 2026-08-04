import { getSignal, updateSignalState, deleteSignal } from "@/lib/signal-actions";
import { StateBadge, EntityTypeBadge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Zap, Lightbulb, Search, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SignalDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const signal = await getSignal(id);
  if (!signal) notFound();

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type="SIGNAL" />
            <StateBadge state={signal.state} />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{signal.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Captured on {signal.createdAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {signal.state === "INBOX" && (
            <>
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "ACTIVE")} label="Activate" />
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "DORMANT")} label="Dormant" variant="purple" />
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "CLOSED")} label="Close" variant="gray" />
            </>
          )}
          {signal.state === "ACTIVE" && (
            <>
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "DORMANT")} label="Dormant" variant="purple" />
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "CLOSED")} label="Close" variant="gray" />
            </>
          )}
          {signal.state === "DORMANT" && (
            <>
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "ACTIVE")} label="Reactivate" />
              <StateButton id={signal.id} action={updateSignalState.bind(null, id, "CLOSED")} label="Archive" variant="gray" />
            </>
          )}
        </div>
      </div>

      {/* Body */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-sm font-medium text-gray-500">What I noticed</h2>
        <p className="mt-2 text-sm leading-relaxed text-gray-900">{signal.body}</p>
        {signal.context && (
          <>
            <h2 className="mt-4 text-sm font-medium text-gray-500">Context</h2>
            <p className="mt-2 text-sm text-gray-900">{signal.context}</p>
          </>
        )}
      </div>

      {/* Intents */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Intents / Approaches</h2>
          <Link
            href={`/intents/new?signalId=${signal.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            Add Intent
          </Link>
        </div>
        {signal.intents.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No approaches yet. One signal may have multiple possible intents.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {signal.intents.map((intent) => (
              <Link
                key={intent.id}
                href={`/intents/${intent.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-violet-500" />
                  <span className="text-sm font-medium text-gray-900">{intent.title}</span>
                  <StateBadge state={intent.state} />
                </div>
                <p className="mt-1 text-sm text-gray-500">
                  By trying <span className="font-medium">{intent.approach}</span>, I expect{" "}
                  <span className="font-medium">{intent.expectedChange}</span>, because I believe{" "}
                  <span className="font-medium">{intent.assumption}</span>.
                </p>
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* Explorations */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Explorations</h2>
          <Link
            href={`/explorations/new?signalId=${signal.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            Add Exploration
          </Link>
        </div>
        {signal.explorations.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No explorations yet. Use when the signal is too unclear to form an intent.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {signal.explorations.map((exp) => (
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

      {/* Transition History */}
      {signal.transitionsTo.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {signal.transitionsTo.map((t) => (
              <div key={t.id} className="border-l-2 border-gray-200 pl-4">
                <p className="text-sm text-gray-900">{t.reason}</p>
                {t.evidence && (
                  <p className="mt-1 text-sm text-gray-500">Evidence: {t.evidence}</p>
                )}
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
  id,
  action,
  label,
  variant = "green",
}: {
  id: string;
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
      <button
        type="submit"
        className={`rounded-md px-3 py-1.5 text-xs font-medium ${colors[variant]}`}
      >
        {label}
      </button>
    </form>
  );
}
