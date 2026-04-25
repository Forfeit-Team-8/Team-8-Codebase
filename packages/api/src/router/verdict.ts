import type { TRPCRouterRecord } from "@trpc/server";

import { runAgent } from "../agent";
import { verdictInputSchema } from "../agent/types";
import { publicProcedure } from "../trpc";

/**
 * STUB ROUTER — for the agent debug page only.
 *
 * `verdict.run` is a streaming subscription that:
 *   1. Takes the goal + evidence directly as input (NO database lookup yet —
 *      the goals/stakes/verdicts/evidence tables don't exist).
 *   2. Runs the agent, yielding normalized events to the client as they happen.
 *   3. Does NOT persist the verdict, NOT trigger Mollie refund/forfeit, NOT
 *      flip any goal status. All of that is downstream of the agent and lives
 *      in TEA-5 (db schema) / TEA-6 (real verdict mutations) / TEA-11 (Mollie).
 *
 * `publicProcedure` for now since the demo skips auth gating. Switch to
 * `protectedProcedure` once user auth is wired through to the agent.
 */
export const verdictRouter = {
  run: publicProcedure.input(verdictInputSchema).subscription(async function* ({
    input,
    signal,
  }) {
    for await (const event of runAgent(input)) {
      if (signal?.aborted) return;
      yield event;
    }
  }),
} satisfies TRPCRouterRecord;
