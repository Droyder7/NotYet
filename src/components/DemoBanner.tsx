"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Sparkles, Trash2, ChevronDown, ChevronUp } from "lucide-react";
import { loadDemoData, clearAllData } from "@/lib/demo-actions";

interface DemoBannerProps {
  isEmpty: boolean;
  hasDemoData: boolean;
}

export function DemoBanner({ isEmpty, hasDemoData }: DemoBannerProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  if (!isEmpty && !hasDemoData) return null;

  function handleLoad() {
    startTransition(async () => {
      await loadDemoData();
      router.refresh();
    });
  }

  function handleClear() {
    startTransition(async () => {
      await clearAllData();
      setOpen(false);
      router.refresh();
    });
  }

  return (
    <div className="mb-6 rounded-lg border border-dashed border-blue-300 bg-blue-50">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="flex items-center gap-2.5">
          <Sparkles className="h-4 w-4 shrink-0 text-blue-600" />
          {isEmpty ? (
            <p className="text-sm text-blue-800">
              Your system is empty. Load a demo dataset to explore how signals,
              intents, experiments, and projects flow together.
            </p>
          ) : (
            <p className="text-sm text-blue-800">
              Demo data is loaded. Everything you see is sample content — clear
              it any time to start for real.
            </p>
          )}
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isEmpty && (
            <ActionButton
              onClick={handleLoad}
              pending={isPending}
              label="Load Demo Data"
              pendingLabel="Seeding…"
              variant="primary"
            />
          )}
          {hasDemoData && !isEmpty && (
            <ActionButton
              onClick={handleClear}
              pending={isPending}
              label="Clear All Data"
              pendingLabel="Clearing…"
              variant="danger"
            />
          )}
          <button
            onClick={() => setOpen(!open)}
            className="inline-flex items-center gap-1 rounded-md px-2 py-1.5 text-xs font-medium text-blue-700 hover:bg-blue-100"
          >
            {open ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
            {open ? "Hide tour" : "How it works"}
          </button>
        </div>
      </div>

      {open && (
        <div className="border-t border-blue-200 bg-white/60 px-4 py-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-blue-800">
            Six stories in the demo data
          </p>
          <ol className="mt-2 grid gap-1.5 text-sm text-gray-700 md:grid-cols-2">
            <TourItem n={1} href="/signals" label="Full chain — one signal travels to an active project (voice capture)" />
            <TourItem n={2} href="/experiments" label="Career — an active exploration plus an experiment nearing decision" />
            <TourItem n={3} href="/intents" label="Cheap rejection — an intent closed early, successfully" />
            <TourItem n={4} href="/experiments" label="Waiting — an experiment blocked by an external billing cycle" />
            <TourItem n={5} href="/signals" label="Unprocessed inbox — one raw signal waiting for the weekly review" />
            <TourItem n={6} href="/candidates" label="Candidates — dormant, unassessed, then activated (Worthy/Ready/Now)" />
          </ol>
          <div className="mt-3 flex flex-wrap gap-2 border-t border-blue-100 pt-3">
            <Link href="/graph" className="rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700">
              Open the Graph
            </Link>
            <Link href="/review/weekly" className="rounded bg-gray-800 px-2.5 py-1 text-xs font-medium text-white hover:bg-gray-700">
              Run the Weekly Review
            </Link>
            <Link href="/review/monthly" className="rounded bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200">
              Run the Monthly Review
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

function TourItem({ n, href, label }: { n: number; href: string; label: string }) {
  return (
    <li className="flex items-start gap-2">
      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
        {n}
      </span>
      <Link href={href} className="leading-snug hover:text-blue-700 hover:underline">
        {label}
      </Link>
    </li>
  );
}

function ActionButton({
  onClick,
  pending,
  label,
  pendingLabel,
  variant,
}: {
  onClick: () => void;
  pending: boolean;
  label: string;
  pendingLabel: string;
  variant: "primary" | "danger";
}) {
  const styles = {
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };
  return (
    <button
      onClick={onClick}
      disabled={pending}
      className={`inline-flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium disabled:opacity-50 ${styles[variant]}`}
    >
      {variant === "danger" && <Trash2 className="h-3.5 w-3.5" />}
      {pending ? pendingLabel : label}
    </button>
  );
}
