"use client";

import { useFormStatus } from "react-dom";
import { createExploration } from "@/lib/exploration-actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Exploration"}
    </button>
  );
}

export default function NewExplorationPage() {
  async function action(formData: FormData) {
    const signalId = new URLSearchParams(window.location.search).get("signalId");
    const intentId = new URLSearchParams(window.location.search).get("intentId");
    await createExploration({
      title: formData.get("title") as string,
      unclearWhat: formData.get("unclearWhat") as string,
      scope: formData.get("scope") as string,
      budget: formData.get("budget") as string,
      endDate: formData.get("endDate") as string,
      stoppingCondition: formData.get("stoppingCondition") as string,
      expectedOutput: formData.get("expectedOutput") as string,
      signalId: signalId || undefined,
      intentId: intentId || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Exploration</h1>
        <p className="mt-1 text-sm text-gray-500">
          A bounded investigation for when a signal or intent is too unclear to form a testable assumption.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div className="rounded-md bg-amber-50 p-4 text-sm text-amber-800">
          <p className="font-medium">Exploration template:</p>
          <p className="mt-1">
            I need to understand <span className="font-medium">[unknown]</span>. I will spend{" "}
            <span className="font-medium">[budget]</span> investigating <span className="font-medium">[scope]</span>, after which I will either define an intent, formulate an experiment, or close the matter.
          </p>
        </div>

        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">Title</label>
          <input id="title" name="title" type="text" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="unclearWhat" className="block text-sm font-medium text-gray-700">What is currently unclear?</label>
          <textarea id="unclearWhat" name="unclearWhat" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="scope" className="block text-sm font-medium text-gray-700">What will be investigated? (scope)</label>
          <textarea id="scope" name="scope" rows={2} required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="budget" className="block text-sm font-medium text-gray-700">Budget (time, money, attention)</label>
          <input id="budget" name="budget" type="text" required placeholder="e.g. 3 hours, $0, 2 focused sessions" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">End date</label>
          <input id="endDate" name="endDate" type="date" required className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="stoppingCondition" className="block text-sm font-medium text-gray-700">Stopping condition</label>
          <input id="stoppingCondition" name="stoppingCondition" type="text" required placeholder="How will you know when to stop?" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div>
          <label htmlFor="expectedOutput" className="block text-sm font-medium text-gray-700">Expected output</label>
          <textarea id="expectedOutput" name="expectedOutput" rows={2} required placeholder="What should this exploration produce?" className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500" />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton />
          <Link href="/explorations" className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50">
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
