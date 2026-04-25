import { authRouter } from "./router/auth";
import { evidenceRouter } from "./router/evidence";
import { postRouter } from "./router/post";
import { verdictRouter } from "./router/verdict";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  evidence: evidenceRouter,
  verdict: verdictRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
