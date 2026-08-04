"use client";

import { useFormStatus } from "react-dom";
import { createSignal } from "@/lib/signal-actions";
import Link from "next/link";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? "Capturing..." : "Capture Signal"}
    </button>
  );
}

export default function NewSignalPage() {
  async function action(formData: FormData) {
    await createSignal({
      title: formData.get("title") as string,
      body: formData.get("body") as string,
      context: (formData.get("context") as string) || undefined,
    });
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Capture Signal</h1>
        <p className="mt-1 text-sm text-gray-500">
          Something you noticed that may deserve attention. No commitment — just capture it.
        </p>
      </div>

      <form action={action} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
        <div>
          <label htmlFor="title" className="block text-sm font-medium text-gray-700">
            What did you notice?
          </label>
          <input
            id="title"
            name="title"
            type="text"
            required
            placeholder='e.g. "I regularly have useful thoughts but forget them"'
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="body" className="block text-sm font-medium text-gray-700">
            What stood out about it?
          </label>
          <textarea
            id="body"
            name="body"
            rows={4}
            required
            placeholder="Any context that would otherwise be forgotten..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div>
          <label htmlFor="context" className="block text-sm font-medium text-gray-700">
            Context or source (optional)
          </label>
          <input
            id="context"
            name="context"
            type="text"
            placeholder="Where or when did you notice this?"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
          />
        </div>

        <div className="flex items-center gap-3 pt-2">
          <SubmitButton />
          <Link
            href="/signals"
            className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
