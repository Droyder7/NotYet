import { prisma } from "@/lib/db";
import { Card } from "@/components/Card";
import { STATE_LABELS } from "@/lib/types";
import { CalendarCheck, AlertTriangle, CheckCircle } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function WeeklyReviewPage() {
  const now = new Date();
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

  const [
    inboxSignals,
    activeExplorations,
    experimentsDueSoon,
    dormantCandidates,
    activeProjects,
    unassessedCandidates,
  ] = await Promise.all([
    prisma.signal.findMany({ where: { state: "INBOX" }, orderBy: { createdAt: "desc" } }),
    prisma.exploration.findMany({ where: { state: "ACTIVE" }, orderBy: { endDate: "asc" } }),
    prisma.experiment.findMany({
      where: { state: "ACTIVE", decisionDate: { lte: sevenDaysFromNow } },
      orderBy: { decisionDate: "asc" },
    }),
    prisma.projectCandidate.findMany({ where: { state: "DORMANT" } }),
    prisma.activeProject.findMany({ where: { state: "ACTIVE" } }),
    prisma.projectCandidate.findMany({
      where: { state: "INBOX", worthy: "UNASSESSED" },
    }),
  ]);

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-3">
        <CalendarCheck className="h-8 w-8 text-gray-400" />
        <div>
          <h1 className="text-2xl font-bold">Weekly Review</h1>
          <p className="mt-1 text-sm text-gray-500">
            {now.toLocaleDateString()} — Clarify signals, make decisions, update states
          </p>
        </div>
      </div>

      {/* 1. Unprocessed Signals */}
      <ReviewSection
        title="Clarify Signals"
        description="Signals in inbox need processing"
        count={inboxSignals.length}
        complete={inboxSignals.length === 0}
      >
        {inboxSignals.map((s) => (
          <Card
            key={s.id}
            id={s.id}
            title={s.title}
            type="SIGNAL"
            state={s.state}
            href={`/signals/${s.id}`}
            summary={s.body.slice(0, 120)}
            date={s.createdAt.toLocaleDateString()}
          />
        ))}
      </ReviewSection>

      {/* 2. Active Explorations */}
      <ReviewSection
        title="Active Explorations"
        description="Check remaining budget and progress"
        count={activeExplorations.length}
        complete={activeExplorations.length === 0}
      >
        {activeExplorations.map((exp) => {
          const overdue = exp.endDate < now;
          return (
            <Card
              key={exp.id}
              id={exp.id}
              title={exp.title}
              type="EXPLORATION"
              state={exp.state}
              href={`/explorations/${exp.id}`}
              summary={`Budget: ${exp.budget} | End: ${exp.endDate.toLocaleDateString()}${overdue ? " (OVERDUE)" : ""}`}
              date={exp.endDate.toLocaleDateString()}
            />
          );
        })}
      </ReviewSection>

      {/* 3. Experiments needing decisions */}
      <ReviewSection
        title="Experiments Due for Decision"
        description="Experiments approaching or past their decision date"
        count={experimentsDueSoon.length}
        complete={experimentsDueSoon.length === 0}
      >
        {experimentsDueSoon.map((exp) => {
          const overdue = exp.decisionDate < now;
          return (
            <Card
              key={exp.id}
              id={exp.id}
              title={exp.title}
              type="EXPERIMENT"
              state={exp.state}
              href={`/experiments/${exp.id}`}
              summary={`${exp.decisionGoal.slice(0, 100)}...${overdue ? " (DECISION OVERDUE)" : ""}`}
              date={exp.decisionDate.toLocaleDateString()}
            />
          );
        })}
      </ReviewSection>

      {/* 4. Unassessed Candidates */}
      <ReviewSection
        title="Unassessed Project Candidates"
        description="Candidates that need Worthy/Ready/Now assessment"
        count={unassessedCandidates.length}
        complete={unassessedCandidates.length === 0}
      >
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
      </ReviewSection>

      {/* 5. Active Project WIP Check */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold">WIP Limits Check</h2>
        <div className="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
          <WipStatus label="Active Explorations" current={activeExplorations.length} limit={2} />
          <WipStatus label="Active Experiments" current={experimentsDueSoon.length} limit={2} />
          <WipStatus
            label="Major Projects"
            current={activeProjects.filter((p) => p.projectSlot === "MAJOR").length}
            limit={1}
          />
          <WipStatus
            label="Minor Projects"
            current={activeProjects.filter((p) => p.projectSlot === "MINOR").length}
            limit={2}
          />
        </div>
      </div>

      {/* 6. Dormant review note */}
      {dormantCandidates.length > 0 && (
        <div className="rounded-lg border border-purple-200 bg-purple-50 p-4">
          <h3 className="text-sm font-semibold text-purple-900">
            {dormantCandidates.length} dormant candidate{dormantCandidates.length !== 1 ? "s" : ""}
          </h3>
          <p className="mt-1 text-sm text-purple-700">
            Review whether any dormant candidate&apos;s trigger has occurred or conditions have changed.
          </p>
        </div>
      )}
    </div>
  );
}

function ReviewSection({
  title,
  description,
  count,
  complete,
  children,
}: {
  title: string;
  description: string;
  count: number;
  complete: boolean;
  children: React.ReactNode;
}) {
  return (
    <section>
      <div className="flex items-center gap-2">
        {complete ? (
          <CheckCircle className="h-5 w-5 text-green-600" />
        ) : count > 0 ? (
          <AlertTriangle className="h-5 w-5 text-amber-500" />
        ) : null}
        <div>
          <h2 className="text-lg font-semibold">{title}</h2>
          <p className="text-sm text-gray-500">{description}</p>
        </div>
        {!complete && count > 0 && (
          <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
            {count}
          </span>
        )}
      </div>
      <div className="mt-3 space-y-2">{children}</div>
    </section>
  );
}

function WipStatus({
  label,
  current,
  limit,
}: {
  label: string;
  current: number;
  limit: number;
}) {
  const over = current > limit;
  return (
    <div className="rounded-md bg-gray-50 p-3 text-center">
      <p className="text-xs font-medium text-gray-500">{label}</p>
      <p className={`mt-1 text-lg font-bold ${over ? "text-red-600" : "text-gray-900"}`}>
        {current} / {limit}
      </p>
      {over && <p className="mt-0.5 text-xs text-red-600">Over limit!</p>}
    </div>
  );
}
