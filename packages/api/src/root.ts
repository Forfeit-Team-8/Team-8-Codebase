import { authRouter } from "./router/auth";
import { courtRouter } from "./router/court";
import { evidenceRouter } from "./router/evidence";
import { ngoRouter } from "./router/ngo";
import { pactRouter } from "./router/pact";
import { postRouter } from "./router/post";
import { verdictRouter } from "./router/verdict";
import { createTRPCRouter } from "./trpc";

// NOTE: There are two parallel verdict-flow systems in this router right now,
// added by separate branches that have not yet been reconciled:
//  - `evidence` + `verdict` come from the agent track (real Claude agent,
//    streaming tool-use, file_id evidence). Used by the agent-debug screen.
//  - `pact` + `court` + `ngo` come from the UI track (deterministic court
//    "agent" stub, Pact/Checkin domain). Used by the main app screens.
// One of them will absorb the other; both are kept for now so neither
// teammate is blocked.
export const appRouter = createTRPCRouter({
  auth: authRouter,
  post: postRouter,
  evidence: evidenceRouter,
  verdict: verdictRouter,
  ngo: ngoRouter,
  pact: pactRouter,
  court: courtRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;
