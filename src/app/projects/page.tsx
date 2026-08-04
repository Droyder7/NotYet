import { getProjects } from "@/lib/project-actions";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProjectsPage() {
  const projects = await getProjects();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Active Projects</h1>
          <p className="mt-1 text-sm text-gray-500">
            Finite, explicitly chosen commitments currently funded with time and attention
          </p>
        </div>
        <Link
          href="/projects/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Link>
      </div>

      {projects.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <p className="text-sm font-medium text-gray-900">No active projects</p>
          <p className="mt-1 text-sm text-gray-500">
            Projects become active only after passing the Worthy/Ready/Now assessment.
          </p>
        </div>
      ) : (
        <div className="space-y-2">
          {projects.map((p) => (
            <Card
              key={p.id}
              id={p.id}
              title={p.title}
              type="ACTIVE_PROJECT"
              state={p.state}
              href={`/projects/${p.id}`}
              summary={`Next: ${p.nextConcreteAction} | Deadline: ${p.deadline.toLocaleDateString()}`}
              date={p.deadline.toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
