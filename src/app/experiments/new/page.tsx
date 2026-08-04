"use client";

import { useFormStatus } from "react-dom";
import { createExperiment } from "@/lib/experiment-actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Experiment"}
    </button>
  );
}

export default function NewExperimentPage() {
  async function action(formData: FormData) {
    const intentId = new URLSearchParams(window.location.search).get("intentId");
    const explorationId = new URLSearchParams(window.location.search).get("explorationId");
    await createExperiment({
      title: formData.get("title") as string,
      decisionGoal: formData.get("decisionGoal") as string,
      nextCommitment: formData.get("nextCommitment") as string,
      criticalAssumption: formData.get("criticalAssumption") as string,
      testMethod: formData.get("testMethod") as string,
      observableEvidence: formData.get("observableEvidence") as string,
      budget: formData.get("budget") as string,
      decisionDate: formData.get("decisionDate") as string,
      intentId: intentId || undefined,
      explorationId: explorationId || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Experiment</h1>
        <p className="mt-1 text-sm text-gray-500">
          A bounded attempt to reduce an important uncertainty so that a decision can be made.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="rounded-md bg-red-50 p-4 text-sm text-red-800">
          <p className="font-medium">Decision goal template:</p>
          <p className="mt-1">
            By <span className="font-medium">[date/budget]</span>, determine whether to{" "}
            <span className="font-medium">[continue/change/stop/hold/transition]</span> this approach by testing whether{" "}
            <span className="font-medium">[critical assumption]</span> is supported by{" "}
            <span className="font-medium">[observable evidence]</span>.
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input id="title" name="title" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="decisionGoal" className="block text-sm font-medium text-gray-700">Decision goal</label>
          <textarea id="decisionGoal" name="decisionGoal" rows={3} required placeholder="By when, decide whether to what, by testing whether..." className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="nextCommitment" className="block text-sm font-medium text-gray-700">Next commitment being evaluated</label>
          <input id="nextCommitment" name="nextCommitment" type="text" required placeholder="e.g. Commit four weekends to building an MVP" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="criticalAssumption" className="block text-sm font-medium text-gray-700">Critical assumption (single one)</label>
          <input id="criticalAssumption" name="criticalAssumption" type="text" required placeholder="If false, the next commitment would be a poor use of time/money" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="testMethod" className="block text-sm font-medium text-gray-700">Test method</label>
          <textarea id="testMethod" name="testMethod" rows={2} required placeholder="How will you test this assumption?" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="observableEvidence" className="block text-sm font-medium text-gray-700">Minimum observable evidence</label>
          <textarea id="observableEvidence" name="observableEvidence" rows={2} required placeholder="What is the minimum evidence that would make the next commitment rational?" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget</label>
          <input id="budget" name="budget" type="text" required placeholder="e.g. 14 days, $50, 2 weekends" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="decisionDate" className="block text-sm font-medium text-gray-700">Decision date</label>
          <input id="decisionDate" name="decisionDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton />
          <Link href="/experiments" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
