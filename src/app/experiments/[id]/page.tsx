import { getExperiment, updateExperimentState, setExperimentDecision } from "@/lib/experiment-actions";
import { StateBadge, EntityTypeBadge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ClipboardList, Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExperimentDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const experiment = await getExperiment(id);
  if (!experiment) notFound();

  const isDecisionDue = experiment.state === "ACTIVE" && new Date() >= experiment.decisionDate;
  const hasDecision = experiment.finalDecision !== null;

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type="EXPERIMENT" />
            <StateBadge state={experiment.state} />
            {isDecisionDue && !hasDecision && (
              <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                Decision Due
              </span>
            )}
          </div>
          <h1 className="mt-2 text-2xl font-bold">{experiment.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Decision by: {experiment.decisionDate.toLocaleDateString()} | Budget: {experiment.budget}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {experiment.state === "INBOX" && (
            <>
              <StateButton action={updateExperimentState.bind(null, id, "ACTIVE")} label="Start" />
              <StateButton action={updateExperimentState.bind(null, id, "CLOSED")} label="Abandon" variant="gray" />
            </>
          )}
          {experiment.state === "ACTIVE" && !hasDecision && (
            <>
              <form action={setExperimentDecision.bind(null, id, "CONTINUE", "Evidence supports continuing")}>
                <button type="submit" className="rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700">
                  Continue → Candidate
                </button>
              </form>
              <form action={setExperimentDecision.bind(null, id, "CHANGE", "Approach needs refinement")}>
                <button type="submit" className="rounded-md bg-amber-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-amber-700">
                  Change Approach
                </button>
              </form>
              <form action={setExperimentDecision.bind(null, id, "STOP", "Not worth further investment")}>
                <button type="submit" className="rounded-md bg-red-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-red-700">
                  Stop
                </button>
              </form>
              <form action={setExperimentDecision.bind(null, id, "HOLD", "Conditions not right for action")}>
                <button type="submit" className="rounded-md bg-purple-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-purple-700">
                  Hold
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {/* Decision goal */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h2 className="text-sm font-semibold text-red-900">Decision Goal</h2>
        <p className="mt-1 text-sm text-red-800">{experiment.decisionGoal}</p>
      </div>

      {/* Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Next Commitment" value={experiment.nextCommitment} />
          <DetailItem label="Critical Assumption" value={experiment.criticalAssumption} />
          <DetailItem label="Test Method" value={experiment.testMethod} />
          <DetailItem label="Observable Evidence" value={experiment.observableEvidence} />
          <DetailItem label="Budget" value={experiment.budget} />
          {experiment.intent && (
            <DetailItem label="Source Intent" value={experiment.intent.title} />
          )}
          {experiment.exploration && (
            <DetailItem label="Source Exploration" value={experiment.exploration.title} />
          )}
        </dl>
      </div>

      {/* Final decision */}
      {hasDecision && (
        <div className="rounded-lg border border-gray-200 bg-white p-6">
          <h2 className="text-lg font-semibold">Decision</h2>
          <div className="mt-2 flex items-center gap-2">
            <span className={`rounded-full px-2 py-0.5 text-xs font-medium text-white ${
              experiment.finalDecision === "CONTINUE" ? "bg-green-600" :
              experiment.finalDecision === "CHANGE" ? "bg-amber-600" :
              experiment.finalDecision === "STOP" ? "bg-red-600" :
              "bg-purple-600"
            }`}>
              {experiment.finalDecision}
            </span>
          </div>
          {experiment.finalReasoning && (
            <p className="mt-2 text-sm text-gray-600">{experiment.finalReasoning}</p>
          )}
        </div>
      )}

      {/* Project candidates */}
      <div>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Project Candidates</h2>
          <Link
            href={`/candidates/new?experimentId=${experiment.id}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-gray-600 hover:text-gray-900"
          >
            <Plus className="h-4 w-4" />
            New Candidate
          </Link>
        </div>
        {experiment.projectCandidates.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">
            No candidates yet. A successful experiment may produce a project candidate.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {experiment.projectCandidates.map((c) => (
              <Link
                key={c.id}
                href={`/candidates/${c.id}`}
                className="block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
              >
                <div className="flex items-center gap-2">
                  <ClipboardList className="h-4 w-4 text-cyan-500" />
                  <span className="text-sm font-medium text-gray-900">{c.title}</span>
                  <StateBadge state={c.state} />
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>

      {experiment.transitionsTo.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {experiment.transitionsTo.map((t) => (
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
  variant?: "green" | "gray";
}) {
  const colors = {
    green: "bg-green-600 text-white hover:bg-green-700",
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
