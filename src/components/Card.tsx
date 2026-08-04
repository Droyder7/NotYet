import Link from "next/link";
import { cn } from "@/lib/utils";
import { StateBadge, EntityTypeBadge } from "./Badge";
import type { AttentionState, EntityType } from "@prisma/client";

interface CardProps {
  id: string;
  title: string;
  type: EntityType;
  state: AttentionState;
  href: string;
  summary?: string;
  date?: string;
  className?: string;
}

export function Card({ id, title, type, state, href, summary, date, className }: CardProps) {
  return (
    <Link
      href={href}
      className={cn(
        "block rounded-lg border border-gray-200 bg-white p-4 transition-colors hover:border-gray-300 hover:bg-gray-50",
        className
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <EntityTypeBadge type={type} />
            <StateBadge state={state} />
          </div>
          <h3 className="mt-1.5 truncate text-sm font-medium text-gray-900">{title}</h3>
          {summary && (
            <p className="mt-1 line-clamp-2 text-sm text-gray-500">{summary}</p>
          )}
        </div>
        {date && (
          <span className="whitespace-nowrap text-xs text-gray-400">{date}</span>
        )}
      </div>
    </Link>
  );
}
