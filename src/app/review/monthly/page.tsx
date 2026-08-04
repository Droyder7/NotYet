import { prisma } from "@/lib/db";
import { Card } from "@/components/Card";
import { CalendarRange } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function MonthlyReviewPage() {
  const now = new Date();

  const [
    activeProjects,
    unassessedCandidates,
    staleCandidates,
    dormantItems,
  ] = await Promise.all([
    prisma.activeProject.findMany({ where: { state: "ACTIVE" }, orderBy: { deadline: "asc" } }),
    prisma.projectCandidate.findMany({ where: { state: "INBOX", worthy: "UNASSESSED" } }),
    prisma.projectCandidate.findMany({
      where: { state: { not: "CLOSED" }, updatedAt: { lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) } },
    }),
    prisma.projectCandidate.findMany({ where: { state: "DORMANT" } }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <CalendarRange className="h-8 w-8 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold">Monthly Portfolio Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            {now.toLocaleDateString("en-US", { month: "long", year: "numeric" })} — Portfolio and alignment review
          </p>
        </div>
      </div>

      {/* Active Projects */}
      <section>
        <h2 className="text-lg font-semibold">Active Projects ({activeProjects.length})</h2>
        {activeProjects.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No active projects. Is that intentional?</p>
        ) : (
          <div className="mt-3 space-y-2">
            {activeProjects.map((p) => (
              <Card
                key={p.id}
                id={p.id}
                title={p.title}
                type="ACTIVE_PROJECT"
                state={p.state}
                href={`/projects/${p.id}`}
                summary={`Alignment: ${p.primaryAlignment} | Deadline: ${p.deadline.toLocaleDateString()} | Next: ${p.nextConcreteAction}`}
                date={p.deadline.toLocaleDateString()}
              />
            ))}
          </div>
        )}
      </section>

      {/* Project Candidates — unassessed */}
      <section>
        <h2 className="text-lg font-semibold">
          Unassessed Candidates ({unassessedCandidates.length})
        </h2>
        {unassessedCandidates.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">All candidates have been assessed.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {unassessedCandidates.map((c) => (
              <Card
                key={c.id}
                id={c.id}
                title={c.title}
                type="PROJECT_CANDIDATE"
                state={c.state}
                href={`/candidates/${c.id}`}
                summary={`Proposed: ${c.proposedOutcome.slice(0, 100)}...`}
                date={c.createdAt.toLocaleDateString()}
              />
            ))}
          </div>
        )}
      </section>

      {/* Stale Candidates */}
      <section>
        <h2 className="text-lg font-semibold">
          Stale Candidates ({staleCandidates.length})
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Candidates with no activity in the past 30 days. Consider closing or re-engaging.
        </p>
        {staleCandidates.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No stale candidates. Good maintenance.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {staleCandidates.map((c) => (
              <Card
                key={c.id}
                id={c.id}
                title={c.title}
                type="PROJECT_CANDIDATE"
                state={c.state}
                href={`/candidates/${c.id}`}
                summary={`Last updated: ${c.updatedAt.toLocaleDateString()}`}
                date={c.updatedAt.toLocaleDateString()}
              />
            ))}
          </div>
        )}
      </section>

      {/* Dormant Candidates */}
      <section>
        <h2 className="text-lg font-semibold">
          Dormant Candidates ({dormantItems.length})
        </h2>
        <p className="mt-1 text-sm text-gray-500">
          Review whether any dormant candidate&apos;s trigger has occurred or conditions have changed.
        </p>
        {dormantItems.length === 0 ? (
          <p className="mt-2 text-sm text-gray-500">No dormant candidates.</p>
        ) : (
          <div className="mt-3 space-y-2">
            {dormantItems.map((c) => (
              <Card
                key={c.id}
                id={c.id}
                title={c.title}
                type="PROJECT_CANDIDATE"
                state={c.state}
                href={`/candidates/${c.id}`}
                summary={`Proposed: ${c.proposedOutcome.slice(0, 80)}...`}
              />
            ))}
          </div>
        )}
      </section>

      {/* Alignment Summary */}
      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">Alignment Summary</h2>
        <div className="mt-4 space-y-3">
          {activeProjects.map((p) => (
            <div key={p.id} className="flex items-center justify-between border-b border-gray-100 pb-2">
              <div>
                <span className="text-sm font-medium text-gray-900">{p.title}</span>
                <span className="ml-2 text-xs text-gray-500">({p.projectSlot})</span>
              </div>
              <span className="text-sm text-gray-500">{p.primaryAlignment}</span>
            </div>
          ))}
          {activeProjects.length === 0 && (
            <p className="text-sm text-gray-500">No active projects to review alignment for.</p>
          )}
        </div>
      </section>
    </div>
  );
}
