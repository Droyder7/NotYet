"use client";

import { useFormStatus } from "react-dom";
import { createIntent } from "@/lib/intent-actions";
import Link from "next/link";
import { Suspense } from "react";

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white hover:bg-gray-700 disabled:opacity-50"
    >
      {pending ? "Creating..." : "Create Intent"}
    </button>
  );
}

function NewIntentForm({ signalId }: { signalId: string }) {
  async function action(formData: FormData) {
    await createIntent({
      title: formData.get("title") as string,
      approach: formData.get("approach") as string,
      expectedChange: formData.get("expectedChange") as string,
      assumption: formData.get("assumption") as string,
      signalId: signalId,
    });
  }

  return (
    <form action={action} className="space-y-4 rounded-lg border border-gray-200 bg-white p-6">
      <input type="hidden" name="signalId" value={signalId} />

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
          Intent title
        </label>
        <input
          id="title"
          name="title"
          type="text"
          required
          placeholder="e.g. One-tap voice capture"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div className="rounded-md bg-violet-50 p-4 text-sm text-violet-800">
        <p className="font-medium">Intent template:</p>
        <p className="mt-1">
          By trying <span className="font-medium">[approach]</span>, I expect{" "}
          <span className="font-medium">[change]</span>, because I believe{" "}
          <span className="font-medium">[assumption]</span>.
        </p>
      </div>

      <div>
        <label htmlFor="approach" className="block text-sm font-medium text-gray-700">
          Proposed direction (approach)
        </label>
        <input
          id="approach"
          name="approach"
          type="text"
          required
          placeholder="e.g. one-tap voice capture via phone shortcut"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div>
        <label htmlFor="expectedChange" className="block text-sm font-medium text-gray-700">
          Expected change
        </label>
        <input
          id="expectedChange"
          name="expectedChange"
          type="text"
          required
          placeholder="e.g. I retain more useful ideas"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div>
        <label htmlFor="assumption" className="block text-sm font-medium text-gray-700">
          Important assumption
        </label>
        <input
          id="assumption"
          name="assumption"
          type="text"
          required
          placeholder="e.g. typing friction is the main reason I fail to capture ideas"
          className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-gray-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
        />
      </div>

      <div className="flex items-center gap-3 pt-2">
        <SubmitButton />
        <Link
          href={`/signals/${signalId}`}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}

export default function NewIntentPage({
  searchParams,
}: {
  searchParams: Promise<{ signalId?: string }>;
}) {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold">New Intent / Approach</h1>
        <p className="mt-1 text-sm text-gray-500">
          One possible direction for responding to a signal.
        </p>
      </div>

      <Suspense fallback={<p>Loading...</p>}>
        <ResolvedForm searchParams={searchParams} />
      </Suspense>
    </div>
  );
}

async function ResolvedForm({
  searchParams,
}: {
  searchParams: Promise<{ signalId?: string }>;
}) {
  const { signalId } = await searchParams;
  if (!signalId) {
    return (
      <div className="rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm text-amber-800">
          Please navigate from a signal&apos;s detail page to create an intent.
        </p>
        <Link href="/signals" className="mt-2 inline-block text-sm font-medium text-amber-900 underline">
          Go to Signals
        </Link>
      </div>
    );
  }
  return <NewIntentForm signalId={signalId} />;
}
