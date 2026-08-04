"use client";

import { useFormStatus } from "react-dom";
import { createActiveProject } from "@/lib/project-actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Project"}
    </button>
  );
}

export default function NewProjectPage() {
  async function action(formData: FormData) {
    await createActiveProject({
      title: formData.get("title") as string,
      desiredOutcome: formData.get("desiredOutcome") as string,
      acceptanceCriteria: formData.get("acceptanceCriteria") as string,
      primaryAlignment: formData.get("primaryAlignment") as string,
      deadline: formData.get("deadline") as string,
      realisticLeadTime: formData.get("realisticLeadTime") as string,
      currentMilestone: formData.get("currentMilestone") as string,
      nextConcreteAction: formData.get("nextConcreteAction") as string,
      majorDependency: formData.get("majorDependency") as string || undefined,
      projectSlot: formData.get("projectSlot") as "MAJOR" | "MINOR",
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Active Project</h1>
        <p className="mt-1 text-sm text-gray-500">
          A finite, explicitly chosen commitment with time and attention allocated.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input id="title" name="title" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="desiredOutcome" className="block text-sm font-medium text-gray-700">Final desired outcome</label>
          <textarea id="desiredOutcome" name="desiredOutcome" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="acceptanceCriteria" className="block text-sm font-medium text-gray-700">Acceptance criteria</label>
          <textarea id="acceptanceCriteria" name="acceptanceCriteria" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="primaryAlignment" className="block text-sm font-medium text-gray-700">Primary alignment (goal or area)</label>
          <input id="primaryAlignment" name="primaryAlignment" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
          <input id="deadline" name="deadline" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="realisticLeadTime" className="block text-sm font-medium text-gray-700">Realistic lead time</label>
          <input id="realisticLeadTime" name="realisticLeadTime" type="text" required placeholder="e.g. 4 weekends, 6 weeks" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="currentMilestone" className="block text-sm font-medium text-gray-700">Current milestone</label>
          <input id="currentMilestone" name="currentMilestone" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="nextConcreteAction" className="block text-sm font-medium text-gray-700">Next concrete action</label>
          <input id="nextConcreteAction" name="nextConcreteAction" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="majorDependency" className="block text-sm font-medium text-gray-700">Major dependency or blocker</label>
          <input id="majorDependency" name="majorDependency" type="text" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="projectSlot" className="block text-sm font-medium text-gray-700">Project slot</label>
          <select id="projectSlot" name="projectSlot" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500">
            <option value="MAJOR">Major (1 slot max)</option>
            <option value="MINOR">Minor (2 slots max)</option>
          </select>
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton />
          <Link href="/projects" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
