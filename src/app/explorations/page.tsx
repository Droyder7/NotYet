import { getExplorations } from "@/lib/exploration-actions";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ExplorationsPage() {
  const explorations = await getExplorations();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Explorations</h1>
          <p className="mt-1 text-sm text-gray-500">
            Bounded investigations when a signal or intent is too unclear
          </p>
        </div>
        <Link
          href="/explorations/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          New Exploration
        </Link>
      </div>

      {explorations.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <p className="text-sm font-medium text-gray-900">No explorations yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Use explorations only when you cannot yet form a useful assumption.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {explorations.map((exp) => (
            <Card
              key={exp.id}
              id={exp.id}
              title={exp.title}
              type="EXPLORATION"
              state={exp.state}
              href={`/explorations/${exp.id}`}
              summary={`Budget: ${exp.budget} | End: ${exp.endDate.toLocaleDateString()}`}
              date={exp.createdAt.toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
