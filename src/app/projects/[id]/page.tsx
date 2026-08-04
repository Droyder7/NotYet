import { getProject, updateProjectState } from "@/lib/project-actions";
import { StateBadge, EntityTypeBadge } from "@/components/Badge";
import Link from "next/link";
import { notFound } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const project = await getProject(id);
  if (!project) notFound();

  return (
    <div className="space-y-8">
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2">
            <EntityTypeBadge type="ACTIVE_PROJECT" />
            <StateBadge state={project.state} />
          </div>
          <h1 className="mt-2 text-2xl font-bold">{project.title}</h1>
          <p className="mt-1 text-sm text-gray-500">
            Deadline: {project.deadline.toLocaleDateString()} | Slot: {project.projectSlot}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {project.state === "ACTIVE" && (
            <>
              <StateButton action={updateProjectState.bind(null, id, "DORMANT")} label="Pause" variant="purple" />
              <StateButton action={updateProjectState.bind(null, id, "CLOSED")} label="Complete" variant="gray" />
            </>
          )}
          {project.state === "DORMANT" && (
            <>
              <StateButton action={updateProjectState.bind(null, id, "ACTIVE")} label="Resume" />
              <StateButton action={updateProjectState.bind(null, id, "CLOSED")} label="Cancel" variant="gray" />
            </>
          )}
        </div>
      </div>

      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailItem label="Desired Outcome" value={project.desiredOutcome} />
          <DetailItem label="Acceptance Criteria" value={project.acceptanceCriteria} />
          <DetailItem label="Primary Alignment" value={project.primaryAlignment} />
          <DetailItem label="Realistic Lead Time" value={project.realisticLeadTime} />
          <DetailItem label="Current Milestone" value={project.currentMilestone} />
          <DetailItem label="Next Action" value={project.nextConcreteAction} />
          {project.majorDependency && (
            <DetailItem label="Major Dependency" value={project.majorDependency} />
          )}
        </dl>
      </div>

      {project.projectCandidate && (
        <div>
          <h2 className="text-lg font-semibold">Source Candidate</h2>
          <Link
            href={`/candidates/${project.projectCandidate.id}`}
            className="mt-2 block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50"
          >
            <p className="text-sm font-medium text-gray-900">{project.projectCandidate.title}</p>
            <p className="mt-1 text-sm text-gray-500">
              Worthy: {project.projectCandidate.worthy} | Ready: {project.projectCandidate.ready} | Now: {project.projectCandidate.now}
            </p>
          </Link>
        </div>
      )}

      {project.transitionsTo.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold">History</h2>
          <div className="mt-3 space-y-3">
            {project.transitionsTo.map((t) => (
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
