import type { TRPCRouterRecord } from "@trpc/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { asc, eq } from "@acme/db";
import { Ngo } from "@acme/db/schema";

import { publicProcedure } from "../trpc";

export const ngoRouter = {
  list: publicProcedure.query(({ ctx }) => {
    return ctx.db.query.Ngo.findMany({
      orderBy: asc(Ngo.sortOrder),
    });
  }),

  byId: publicProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const ngo = await ctx.db.query.Ngo.findFirst({
        where: eq(Ngo.id, input.id),
      });
      if (!ngo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "NGO not found" });
      }
      return ngo;
    }),
} satisfies TRPCRouterRecord;
