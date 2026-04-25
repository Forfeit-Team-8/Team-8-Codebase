import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { and, desc, eq, sql } from "@acme/db";
import { Checkin, Ngo, Pact } from "@acme/db/schema";

import { protectedProcedure } from "../trpc";

const CreatePactInput = z.object({
  title: z.string().min(3).max(256),
  durationDays: z.number().int().min(1).max(365),
  ngoId: z.string().min(1).max(32),
  stakeCents: z.number().int().min(100).max(100_000),
});

const PactIdInput = z.object({ pactId: z.string().uuid() });

export const pactRouter = {
  list: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        id: Pact.id,
        title: Pact.title,
        durationDays: Pact.durationDays,
        stakeCents: Pact.stakeCents,
        status: Pact.status,
        startDate: Pact.startDate,
        ngoId: Pact.ngoId,
        ngoName: Ngo.name,
        ngoEmoji: Ngo.emoji,
        ngoAccent: Ngo.accent,
        completedDays: sql<number>`(
          SELECT COUNT(*)::int FROM ${Checkin}
          WHERE ${Checkin.pactId} = ${Pact.id}
            AND ${Checkin.status} = 'acquitted'
        )`,
      })
      .from(Pact)
      .leftJoin(Ngo, eq(Pact.ngoId, Ngo.id))
      .where(eq(Pact.userId, ctx.session.user.id))
      .orderBy(desc(Pact.createdAt));

    return rows;
  }),

  byId: protectedProcedure
    .input(PactIdInput)
    .query(async ({ ctx, input }) => {
      const pact = await ctx.db.query.Pact.findFirst({
        where: and(
          eq(Pact.id, input.pactId),
          eq(Pact.userId, ctx.session.user.id),
        ),
      });
      if (!pact) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }
      const ngo = await ctx.db.query.Ngo.findFirst({
        where: eq(Ngo.id, pact.ngoId),
      });
      const recent = await ctx.db.query.Checkin.findMany({
        where: eq(Checkin.pactId, pact.id),
        orderBy: desc(Checkin.dayNumber),
        limit: 10,
      });
      const completedRows = await ctx.db
        .select({
          completedDays: sql<number>`COUNT(*) FILTER (WHERE ${Checkin.status} = 'acquitted')::int`,
        })
        .from(Checkin)
        .where(eq(Checkin.pactId, pact.id));

      return {
        pact,
        ngo,
        recent,
        completedDays: completedRows[0]?.completedDays ?? 0,
      };
    }),

  create: protectedProcedure
    .input(CreatePactInput)
    .mutation(async ({ ctx, input }) => {
      const ngoExists = await ctx.db.query.Ngo.findFirst({
        where: eq(Ngo.id, input.ngoId),
        columns: { id: true },
      });
      if (!ngoExists) {
        throw new TRPCError({ code: "BAD_REQUEST", message: "Unknown NGO" });
      }

      const start = new Date();
      const end = new Date(start);
      end.setDate(end.getDate() + input.durationDays);

      // Mock payment authorization — in real life this would call Stripe.
      const mockAuthId = `mock_auth_${Math.random().toString(36).slice(2, 10)}`;

      const [created] = await ctx.db
        .insert(Pact)
        .values({
          userId: ctx.session.user.id,
          title: input.title,
          durationDays: input.durationDays,
          ngoId: input.ngoId,
          stakeCents: input.stakeCents,
          status: "active",
          paymentAuthId: mockAuthId,
          startDate: start,
          endDate: end,
        })
        .returning();

      return created;
    }),

  todayCheckin: protectedProcedure
    .input(PactIdInput)
    .mutation(async ({ ctx, input }) => {
      const pact = await ctx.db.query.Pact.findFirst({
        where: and(
          eq(Pact.id, input.pactId),
          eq(Pact.userId, ctx.session.user.id),
        ),
      });
      if (!pact) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      const dayNumber = Math.min(
        pact.durationDays,
        Math.floor(
          (Date.now() - pact.startDate.getTime()) / (1000 * 60 * 60 * 24),
        ) + 1,
      );

      const existing = await ctx.db.query.Checkin.findFirst({
        where: and(
          eq(Checkin.pactId, pact.id),
          eq(Checkin.dayNumber, dayNumber),
        ),
      });

      if (existing) return existing;

      const [created] = await ctx.db
        .insert(Checkin)
        .values({ pactId: pact.id, dayNumber })
        .returning();
      if (!created) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create checkin",
        });
      }

      return created;
    }),

  stats: protectedProcedure.query(async ({ ctx }) => {
    const rows = await ctx.db
      .select({
        totalAtStakeCents: sql<number>`COALESCE(SUM(${Pact.stakeCents}) FILTER (WHERE ${Pact.status} = 'active'), 0)::int`,
        activeCount: sql<number>`COUNT(*) FILTER (WHERE ${Pact.status} = 'active')::int`,
        completedCount: sql<number>`COUNT(*) FILTER (WHERE ${Pact.status} = 'completed')::int`,
        forfeitedCount: sql<number>`COUNT(*) FILTER (WHERE ${Pact.status} = 'forfeited')::int`,
        totalSavedCents: sql<number>`COALESCE(SUM(${Pact.stakeCents}) FILTER (WHERE ${Pact.status} = 'completed'), 0)::int`,
        totalDonatedCents: sql<number>`COALESCE(SUM(${Pact.stakeCents}) FILTER (WHERE ${Pact.status} = 'forfeited'), 0)::int`,
      })
      .from(Pact)
      .where(eq(Pact.userId, ctx.session.user.id));

    const row = rows[0];
    return {
      totalAtStakeCents: row?.totalAtStakeCents ?? 0,
      activeCount: row?.activeCount ?? 0,
      completedCount: row?.completedCount ?? 0,
      forfeitedCount: row?.forfeitedCount ?? 0,
      totalSavedCents: row?.totalSavedCents ?? 0,
      totalDonatedCents: row?.totalDonatedCents ?? 0,
    };
  }),
} satisfies TRPCRouterRecord;
