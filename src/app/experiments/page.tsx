import { getExperiments } from "@/lib/experiment-actions";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExperimentsPage() {
  const experiments = await getExperiments();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Experiments</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bounded attempts to reduce an important uncertainty for a decision
          </p>
        </div>
        <Link
          href="/experiments/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          New Experiment
        </Link>
      </div>

      {experiments.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <p className="text-sm font-medium text-gray-900">No experiments yet</p>
          <p className="mt-1 text-sm text-gray-500">
            An experiment succeeds when it produces enough evidence to make a better decision.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {experiments.map((exp) => (
            <Card
              key={exp.id}
              id={exp.id}
              title={exp.title}
              type="EXPERIMENT"
              state={exp.state}
              href={`/experiments/${exp.id}`}
              summary={`Decision: ${exp.decisionGoal.slice(0, 120)}...`}
              date={exp.decisionDate.toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
