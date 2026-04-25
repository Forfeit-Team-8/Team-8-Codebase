import type { TRPCRouterRecord } from "@trpc/server";
import Anthropic, { toFile } from "@anthropic-ai/sdk";
import { TRPCError } from "@trpc/server";
import { z } from "zod/v4";

import { publicProcedure } from "../trpc";

/**
 * STUB ROUTER — for the agent debug page.
 *
 * `evidence.uploadPhoto` accepts a base64-encoded image and uploads it to the
 * Anthropic Files API. Returns the file_id, which the client passes back as
 * photo evidence. The agent's `analyze_photo` tool then references this id
 * via `source: { type: "file", file_id }` in its vision sub-call.
 *
 * Why not Supabase Storage / Vercel Blob? For the demo, going straight to
 * Anthropic Files removes a setup step (no bucket / no service key) and the
 * file lands exactly where the agent needs it. Files persist by default and
 * are billed per-storage; for production we'd revisit.
 *
 * `publicProcedure` for now since the demo skips auth gating.
 */

const SUPPORTED_MEDIA_TYPES = [
  "image/jpeg",
  "image/png",
  "image/webp",
  "image/gif",
] as const;

export const evidenceRouter = {
  uploadPhoto: publicProcedure
    .input(
      z.object({
        base64: z
          .string()
          .min(1)
          .max(15_000_000, "Photo is too large; pick a smaller one."),
        mediaType: z.enum(SUPPORTED_MEDIA_TYPES),
      }),
    )
    .mutation(async ({ input }) => {
      let buffer: Uint8Array;
      try {
        buffer = decodeBase64(input.base64);
      } catch {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Invalid base64 payload.",
        });
      }

      const ext = mediaTypeExtension(input.mediaType);
      const client = new Anthropic();

      const file = await client.beta.files.upload({
        file: await toFile(buffer, `evidence.${ext}`, {
          type: input.mediaType,
        }),
        betas: ["files-api-2025-04-14"],
      });

      return { fileId: file.id };
    }),
} satisfies TRPCRouterRecord;

function decodeBase64(b64: string): Uint8Array {
  // Strip a data: prefix if the client accidentally included one.
  const stripped = b64.startsWith("data:")
    ? b64.slice(b64.indexOf(",") + 1)
    : b64;
  // Buffer is Node-only but we're on the server — Edge runtime is off here.
  return Uint8Array.from(Buffer.from(stripped, "base64"));
}

function mediaTypeExtension(mediaType: string): string {
  switch (mediaType) {
    case "image/jpeg":
      return "jpg";
    case "image/png":
      return "png";
    case "image/webp":
      return "webp";
    case "image/gif":
      return "gif";
    default:
      return "bin";
  }
}
