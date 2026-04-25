import { authRouter } from "./router/auth";
import { courtRouter } from "./router/court";
import { ngoRouter } from "./router/ngo";
import { pactRouter } from "./router/pact";
import { postRouter } from "./router/post";
import { createTRPCRouter } from "./trpc";

export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  ngo: ngoRouter,
  pact: pactRouter,
  court: courtRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
