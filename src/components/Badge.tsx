import { cn } from "@/lib/utils";
import { STATE_COLORS, STATE_LABELS, ENTITY_LABELS, ENTITY_COLORS } from "@/lib/types";
import type { AttentionState, EntityType } from "@prisma/client";

export function StateBadge({ state }: { state: AttentionState }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white",
        STATE_COLORS[state]
      )}
    >
      {STATE_LABELS[state]}
    </span>
  );
}

export function EntityTypeBadge({ type }: { type: EntityType }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium text-white",
        ENTITY_COLORS[type]
      )}
    >
      {ENTITY_LABELS[type]}
    </span>
  );
}
