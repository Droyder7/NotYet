import type { AttentionState, EntityType, WorthyReadyNow, FinalDecision, ProjectSlot } from "@prisma/client";

export type { AttentionState, EntityType, WorthyReadyNow, FinalDecision, ProjectSlot };

export interface EntityBadge {
  type: EntityType;
  label: string;
  color: string;
}

export const ENTITY_LABELS: Record<EntityType, string> = {
  SIGNAL: "Signal",
  INTENT: "Intent",
  EXPLORATION: "Exploration",
  EXPERIMENT: "Experiment",
  PROJECT_CANDIDATE: "Project Candidate",
  ACTIVE_PROJECT: "Active Project",
};

export const STATE_LABELS: Record<AttentionState, string> = {
  INBOX: "Inbox",
  ACTIVE: "Active",
  WAITING: "Waiting",
  DORMANT: "Dormant",
  CLOSED: "Closed",
};

export const STATE_COLORS: Record<AttentionState, string> = {
  INBOX: "bg-gray-500",
  ACTIVE: "bg-green-600",
  WAITING: "bg-amber-600",
  DORMANT: "bg-purple-600",
  CLOSED: "bg-gray-700",
};

export const STATE_TEXT_COLORS: Record<AttentionState, string> = {
  INBOX: "text-gray-500",
  ACTIVE: "text-green-600",
  WAITING: "text-amber-600",
  DORMANT: "text-purple-600",
  CLOSED: "text-gray-700",
};

export const ENTITY_COLORS: Record<EntityType, string> = {
  SIGNAL: "bg-blue-500",
  INTENT: "bg-violet-500",
  EXPLORATION: "bg-amber-500",
  EXPERIMENT: "bg-red-500",
  PROJECT_CANDIDATE: "bg-cyan-500",
  ACTIVE_PROJECT: "bg-green-600",
};

export const TRANSITION_MAP: Record<EntityType, EntityType[]> = {
  SIGNAL: ["INTENT", "EXPLORATION"],
  INTENT: ["EXPLORATION", "EXPERIMENT"],
  EXPLORATION: ["INTENT", "EXPERIMENT"],
  EXPERIMENT: ["PROJECT_CANDIDATE", "EXPERIMENT"],
  PROJECT_CANDIDATE: ["ACTIVE_PROJECT"],
  ACTIVE_PROJECT: [],
};

export const VALID_STATES: AttentionState[] = ["INBOX", "ACTIVE", "WAITING", "DORMANT", "CLOSED"];
export const VALID_WRN: WorthyReadyNow[] = ["UNASSESSED", "YES", "NO"];
export const VALID_FINAL_DECISIONS: FinalDecision[] = ["CONTINUE", "CHANGE", "STOP", "HOLD"];

export const WIP_LIMITS = {
  activeExplorations: 2,
  activeExperiments: 2,
  activeMajorProjects: 1,
  activeMinorProjects: 2,
} as const;

export type WipLimits = typeof WIP_LIMITS;
