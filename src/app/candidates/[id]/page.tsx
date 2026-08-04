import { getCandidate, updateCandidateAssessment, activateCandidate, updateCandidateState } from "@/lib/candidate-actions";
import { StateBadge, EntityTypeBadge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle, XCircle, HelpCircle, ArrowRight } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidateDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const candidate = await getCandidate(id);
  if (!candidate) notFound();

  const allAssessed = candidate.worthy !== "UNASSESSED" && candidate.ready !== "UNASSESSED" && candidate.now !== "UNASSESSED";
  const allYes = candidate.worthy === "YES" && candidate.ready === "YES" && candidate.now === "YES";

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type="PROJECT_CANDIDATE" />
            <StateBadge state={candidate.state} />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{candidate.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Created on {candidate.createdAt.toLocaleDateString()}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {candidate.state === "INBOX" && (
            <>
              <StateButton action={updateCandidateState.bind(null, id, "DORMANT")} label="Dormant" />
              <StateButton action={updateCandidateState.bind(null, id, "CLOSED")} label="Close" variant="gray" />
            </>
          )}
          {candidate.state === "DORMANT" && (
            <>
              <StateButton action={updateCandidateState.bind(null, id, "INBOX")} label="Re-evaluate" />
              <StateButton action={updateCandidateState.bind(null, id, "CLOSED")} label="Archive" variant="gray" />
            </>
          )}
          {allYes && candidate.state !== "CLOSED" && (
            <form action={activateCandidate.bind(null, id)}>
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 rounded-md bg-green-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-green-700"
              >
                <ArrowRight className="h-3.5 w-3.5" />
                Activate Project
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Worthy / Ready / Now Assessment */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Activation Assessment</h2>
        <p className="mt-1 text-sm text-gray-500">
          A project becomes active only when Worthy = Yes, Ready = Yes, Now = Yes, and a capacity slot is available.
        </p>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-3">
          <AssessmentCard
            label="Worthy"
            value={candidate.worthy}
            reason={candidate.worthyReason}
            description="Would the outcome create enough meaningful value?"
            candidateId={id}
            field="worthy"
          />
          <AssessmentCard
            label="Ready"
            value={candidate.ready}
            reason={candidate.readyReason}
            description="Is the project understood well enough to begin responsibly?"
            candidateId={id}
            field="ready"
          />
          <AssessmentCard
            label="Now"
            value={candidate.now}
            reason={candidate.nowReason}
            description="Does this project deserve a current slot more than alternatives?"
            candidateId={id}
            field="now"
          />
        </div>

        {allAssessed && !allYes && (
          <div className="mt-4 rounded-md bg-gray-50 p-3 text-sm text-gray-600">
            Not all assessments are positive. This candidate is not yet ready for activation.
          </div>
        )}
        {allYes && (
          <div className="mt-4 rounded-md bg-green-50 p-3 text-sm text-green-800">
            This candidate has passed all three assessments and is ready for activation!
          </div>
        )}
      </div>

      {/* Details */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Proposed Outcome" value={candidate.proposedOutcome} />
          <DetailItem label="Evidence of Value" value={candidate.evidenceOfValue} />
          <DetailItem label="Primary Alignment" value={candidate.primaryAlignment} />
          <DetailItem label="Acceptance Criteria" value={candidate.acceptanceCriteria} />
          <DetailItem label="Constraints" value={candidate.constraints} />
          <DetailItem label="Rough Estimate" value={candidate.roughEstimate} />
        </dl>
      </div>

      {/* Transition history */}
      {candidate.transitionsTo.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {candidate.transitionsTo.map((t) => (
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

function AssessmentCard({
  label,
  value,
  reason,
  description,
  candidateId,
  field,
}: {
  label: string;
  value: string;
  reason: string | null;
  description: string;
  candidateId: string;
  field: "worthy" | "ready" | "now";
}) {
  return (
    <div className="rounded-md border border-gray-200 p-4">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-gray-900">{label}</span>
        <span className="text-lg">
          {value === "YES" && <CheckCircle className="h-5 w-5 text-green-600" />}
          {value === "NO" && <XCircle className="h-5 w-5 text-red-600" />}
          {value === "UNASSESSED" && <HelpCircle className="h-5 w-5 text-gray-400" />}
        </span>
      </div>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
      {reason && <p className="mt-1 text-xs text-gray-600">Reason: {reason}</p>}

      <form action={updateCandidateAssessment.bind(null, candidateId, field, "YES", "Assessed as yes")} className="mt-3">
        <button type="submit" className="w-full rounded bg-green-50 px-2 py-1 text-xs font-medium text-green-700 hover:bg-green-100">
          Yes
        </button>
      </form>
      <form action={updateCandidateAssessment.bind(null, candidateId, field, "NO", "Assessed as no")} className="mt-1">
        <button type="submit" className="w-full rounded bg-red-50 px-2 py-1 text-xs font-medium text-red-700 hover:bg-red-100">
          No
        </button>
      </form>
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
  variant = "purple",
}: {
  action: () => Promise<void>;
  label: string;
  variant?: "purple" | "gray";
}) {
  const colors = {
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
