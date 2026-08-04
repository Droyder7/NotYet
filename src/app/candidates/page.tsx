import { getCandidates } from "@/lib/candidate-actions";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function CandidatesPage() {
  const candidates = await getCandidates();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Project Candidates</h1>
          <p className="mt-1 text-sm text-gray-500">
            Possible finite commitments awaiting Worthy/Ready/Now assessment
          </p>
        </div>
        <Link
          href="/candidates/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          New Candidate
        </Link>
      </div>

      {candidates.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <p className="text-sm font-medium text-gray-900">No project candidates yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Candidates come from experiments that produce positive evidence, or from known obligations.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {candidates.map((c) => (
            <Card
              key={c.id}
              id={c.id}
              title={c.title}
              type="PROJECT_CANDIDATE"
              state={c.state}
              href={`/candidates/${c.id}`}
              summary={`Worthy: ${c.worthy} | Ready: ${c.ready} | Now: ${c.now}`}
              date={c.createdAt.toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
