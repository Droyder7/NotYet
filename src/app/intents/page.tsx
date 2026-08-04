import { getIntents } from "@/lib/intent-actions";
import { Card } from "@/components/Card";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function IntentsPage() {
  const intents = await getIntents();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Intents / Approaches</h1>
          <p className="mt-1 text-sm text-gray-500">
            Possible directions for responding to signals
          </p>
        </div>
        <Link
          href="/intents/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          New Intent
        </Link>
      </div>

      {intents.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-gray-300 py-12">
          <p className="text-sm font-medium text-gray-900">No intents yet</p>
          <p className="mt-1 text-sm text-gray-500">
            Start from a signal and then add an intent as a possible approach.
          </p>
          <Link
            href="/signals/new"
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
          >
            <Plus className="h-4 w-4" />
            Capture a Signal First
          </Link>
        </div>
      ) : (
        <div className="space-y-2">
          {intents.map((intent) => (
            <Card
              key={intent.id}
              id={intent.id}
              title={intent.title}
              type="INTENT"
              state={intent.state}
              href={`/intents/${intent.id}`}
              summary={`${intent.approach} → ${intent.expectedChange}`}
              date={intent.createdAt.toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
