import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, eq } from "@acme/db";
import { Checkin, Pact } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

/**
 * The court "agent" is currently a deterministic stub. The return shape is
 * modeled after a Claude tool-use stream so swapping in a real LLM call later
 * is a one-file change inside this router — the client never has to know.
 *
 * Each turn discriminates on `type`:
 *   - "speak"    : narrator/judge/prosecutor/defense line
 *   - "shout"    : a shouted intro before a speak (OBJECTION! / HOLD IT! / TAKE THAT!)
 *   - "choice"   : present a list of testimony options
 *   - "evidence" : present a list of evidence options
 *   - "verdict"  : end of script, request finalize call
 */
const SpeakTurn = z.object({
  type: z.literal("speak"),
  speaker: z.enum(["judge", "prosecutor", "defense", "narrator"]),
  text: z.string(),
  shout: z.string().optional(),
});
const ChoiceTurn = z.object({
  type: z.literal("choice"),
  prompt: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      tone: z.enum(["good", "mid", "bad"]),
    }),
  ),
});
const EvidenceTurn = z.object({
  type: z.literal("evidence"),
  prompt: z.string(),
  options: z.array(
    z.object({
      id: z.string(),
      label: z.string(),
      emoji: z.string(),
    }),
  ),
});
const VerdictTurn = z.object({ type: z.literal("verdict") });

export const CourtTurn = z.discriminatedUnion("type", [
  SpeakTurn,
  ChoiceTurn,
  EvidenceTurn,
  VerdictTurn,
]);
export type CourtTurn = z.infer<typeof CourtTurn>;

function buildScript(pactTitle: string): CourtTurn[] {
  // Verb in the title controls flavor. We keep the rest generic so any pact works.
  const goal = pactTitle.toLowerCase();
  return [
    {
      type: "speak",
      speaker: "judge",
      text: `Court is now in session. The defendant is accused of skipping their commitment: "${pactTitle}".`,
    },
    {
      type: "speak",
      speaker: "prosecutor",
      shout: "OBJECTION!",
      text: "The prosecution objects to ANY claim of completion without solid evidence!",
    },
    {
      type: "speak",
      speaker: "prosecutor",
      text: "Tell me, defendant... did you actually follow through today?",
    },
    {
      type: "choice",
      prompt: "CHOOSE YOUR TESTIMONY",
      options: [
        { id: "truth", label: "Yes, I did it fully", tone: "good" },
        { id: "lie", label: "Mostly, give or take", tone: "mid" },
        { id: "fail", label: "I didn't do it today", tone: "bad" },
      ],
    },
    {
      type: "speak",
      speaker: "prosecutor",
      shout: "HOLD IT!",
      text: `${goal.includes("run") ? "Then surely you can present the run log!" : "Then surely you can present... PROOF!"}`,
    },
    {
      type: "evidence",
      prompt: "PRESENT EVIDENCE",
      options: [
        { id: "log", label: "Activity log", emoji: "📊" },
        { id: "gps", label: "GPS trace", emoji: "🗺️" },
        { id: "selfie", label: "Selfie", emoji: "🤳" },
        { id: "none", label: "No evidence", emoji: "🤷" },
      ],
    },
    {
      type: "speak",
      speaker: "defense",
      shout: "TAKE THAT!",
      text: "The defense submits this evidence as Exhibit A. The record speaks for itself.",
    },
    {
      type: "speak",
      speaker: "judge",
      text: "Hmm. The court has reviewed the evidence. The verdict shall be rendered.",
    },
    { type: "verdict" },
  ];
}

export const courtRouter = {
  /** Begin a court session for a checkin. Returns the full structured script. */
  startSession: protectedProcedure
    .input(z.object({ checkinId: z.string().uuid() }))
    .mutation(async ({ ctx, input }) => {
      const checkin = await ctx.db.query.Checkin.findFirst({
        where: eq(Checkin.id, input.checkinId),
      });
      if (!checkin) throw new TRPCError({ code: "NOT_FOUND" });

      const pact = await ctx.db.query.Pact.findFirst({
        where: and(
          eq(Pact.id, checkin.pactId),
          eq(Pact.userId, ctx.session.user.id),
        ),
      });
      if (!pact) throw new TRPCError({ code: "FORBIDDEN" });

      return {
        sessionId: checkin.id,
        pactTitle: pact.title,
        script: buildScript(pact.title),
      };
    }),

  /** Persist the courtroom outcome to the checkin row. */
  finalize: protectedProcedure
    .input(
      z.object({
        checkinId: z.string().uuid(),
        won: z.boolean(),
        credibility: z.number().int().min(0).max(5),
        choiceId: z.string().optional(),
        evidenceKind: z.string().optional(),
        transcript: z.array(CourtTurn).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const checkin = await ctx.db.query.Checkin.findFirst({
        where: eq(Checkin.id, input.checkinId),
      });
      if (!checkin) throw new TRPCError({ code: "NOT_FOUND" });

      const pact = await ctx.db.query.Pact.findFirst({
        where: and(
          eq(Pact.id, checkin.pactId),
          eq(Pact.userId, ctx.session.user.id),
        ),
      });
      if (!pact) throw new TRPCError({ code: "FORBIDDEN" });

      const status = input.won ? "acquitted" : "guilty";

      const [updated] = await ctx.db
        .update(Checkin)
        .set({
          status,
          credibility: input.credibility,
          evidenceKind: input.evidenceKind,
          transcript: input.transcript ?? null,
          resolvedAt: new Date(),
        })
        .where(eq(Checkin.id, input.checkinId))
        .returning();

      // Forfeit closes the pact in the design's flow.
      if (!input.won) {
        await ctx.db
          .update(Pact)
          .set({ status: "forfeited" })
          .where(eq(Pact.id, pact.id));
      }

      return {
        checkin: updated!,
        won: input.won,
        stakeCents: pact.stakeCents,
      };
    }),
} satisfies TRPCRouterRecord;
