import { createEnv } from "@t3-oss/env-core";
import { z } from "zod/v4";

export function apiEnv() {
  return createEnv({
    server: {
      ANTHROPIC_API_KEY: z.string().min(1),
    },
    runtimeEnv: process.env,
    skipValidation:
      !!process.env.CI || process.env.npm_lifecycle_event === "lint",
  });
}
