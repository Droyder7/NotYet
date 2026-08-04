"use client";

import { useFormStatus } from "react-dom";
import { createProjectCandidate } from "@/lib/candidate-actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Candidate"}
    </button>
  );
}

export default function NewCandidatePage() {
  async function action(formData: FormData) {
    const experimentId = new URLSearchParams(window.location.search).get("experimentId");
    await createProjectCandidate({
      title: formData.get("title") as string,
      proposedOutcome: formData.get("proposedOutcome") as string,
      evidenceOfValue: formData.get("evidenceOfValue") as string,
      primaryAlignment: formData.get("primaryAlignment") as string,
      acceptanceCriteria: formData.get("acceptanceCriteria") as string,
      constraints: formData.get("constraints") as string,
      roughEstimate: formData.get("roughEstimate") as string,
      experimentId: experimentId || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Project Candidate</h1>
        <p className="mt-1 text-sm text-gray-500">
          A possible finite commitment that appears valuable enough to consider, but has not yet been activated.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input id="title" name="title" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="proposedOutcome" className="block text-sm font-medium text-gray-700">Proposed finite outcome</label>
          <textarea id="proposedOutcome" name="proposedOutcome" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="evidenceOfValue" className="block text-sm font-medium text-gray-700">Evidence supporting its value</label>
          <textarea id="evidenceOfValue" name="evidenceOfValue" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="primaryAlignment" className="block text-sm font-medium text-gray-700">Primary alignment (goal or life area)</label>
          <input id="primaryAlignment" name="primaryAlignment" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="acceptanceCriteria" className="block text-sm font-medium text-gray-700">Draft acceptance criteria</label>
          <textarea id="acceptanceCriteria" name="acceptanceCriteria" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="constraints" className="block text-sm font-medium text-gray-700">Major constraints and dependencies</label>
          <textarea id="constraints" name="constraints" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="roughEstimate" className="block text-sm font-medium text-gray-700">Rough effort / lead time estimate</label>
          <input id="roughEstimate" name="roughEstimate" type="text" required placeholder="e.g. 4 weekends, 2 months" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton />
          <Link href="/candidates" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
