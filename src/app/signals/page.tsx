import { getSignals } from "@/lib/signal-actions";
import { Card } from "@/components/Card";
import { EmptyState } from "@/components/EmptyState";
import Link from "next/link";
import { Plus } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function SignalsPage() {
  const signals = await getSignals();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Signals</h1>
          <p className="mt-1 text-sm text-gray-500">
            Things you notice that may deserve attention
          </p>
        </div>
        <Link
          href="/signals/new"
          className="inline-flex items-center gap-1.5 rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white hover:bg-gray-700"
        >
          <Plus className="h-4 w-4" />
          Capture Signal
        </Link>
      </div>

      {signals.length === 0 ? (
        <EmptyState
          title="No signals yet"
          description="Capture your first signal — something you noticed that may deserve attention."
          actionLabel="Capture Signal"
          actionHref="/signals/new"
        />
      ) : (
        <div className="space-y-2">
          {signals.map((signal) => (
            <Card
              key={signal.id}
              id={signal.id}
              title={signal.title}
              type="SIGNAL"
              state={signal.state}
              href={`/signals/${signal.id}`}
              summary={signal.body.slice(0, 150)}
              date={signal.createdAt.toLocaleDateString()}
            />
          ))}
        </div>
      )}
    </div>
  );
}
