/**
 * STUB TYPES — these mirror what `goals` / `evidence` / `verdicts` tables will
 * look like once TEA-5 (db schema) and TEA-6 (tRPC routes) land. Until then,
 * the agent works on these in-memory shapes and the verdict.run subscription
 * accepts them as direct input (no DB lookup yet).
 *
 * When the real schema lands: replace these imports with the inferred types
 * from `@acme/db/schema` and remove this file.
 */

import { z } from "zod/v4";

export const evidenceSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("photo"),
    // Anthropic Files API id (file_*) — uploaded via evidence.uploadPhoto.
    fileId: z.string().min(1),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal("url"),
    url: z.string().url(),
    note: z.string().optional(),
  }),
  z.object({
    kind: z.literal("text"),
    text: z.string().min(1),
  }),
]);
export type Evidence = z.infer<typeof evidenceSchema>;

export const goalInputSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  deadline: z.string().describe("ISO 8601 timestamp"),
  stakeAmountCents: z.number().int().positive(),
  ngoName: z.string().describe("e.g. 'Voedselbank Amsterdam'"),
});
export type GoalInput = z.infer<typeof goalInputSchema>;

export const verdictInputSchema = z.object({
  goal: goalInputSchema,
  evidence: z.array(evidenceSchema),
});
export type VerdictInput = z.infer<typeof verdictInputSchema>;

export const verdictResultSchema = z.object({
  status: z.enum(["PASS", "FORFEIT"]),
  reasoning: z.string(),
  userMessage: z.string(),
  confidence: z.enum(["high", "medium", "low"]),
});
export type VerdictResult = z.infer<typeof verdictResultSchema>;

/**
 * Events the agent yields as it runs. The tRPC subscription forwards these
 * straight to the client; the debug Expo screen renders them as a timeline.
 */
export type AgentEvent =
  | { type: "thinking_delta"; delta: string }
  | { type: "text_delta"; delta: string }
  | { type: "tool_use"; toolName: string; input: unknown }
  | { type: "tool_result"; toolName: string; result: string; isError?: boolean }
  | { type: "verdict"; verdict: VerdictResult }
  | { type: "error"; message: string };
