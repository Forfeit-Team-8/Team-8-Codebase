import { QueryClient } from "@tanstack/react-query";
import {
  createTRPCClient,
  httpBatchLink,
  httpSubscriptionLink,
  loggerLink,
  splitLink,
} from "@trpc/client";
import { createTRPCOptionsProxy } from "@trpc/tanstack-react-query";
// React Native has no built-in EventSource. react-native-sse provides one
// that's API-compatible enough for tRPC's httpSubscriptionLink.
import RNEventSource from "react-native-sse";
import superjson from "superjson";

import type { AppRouter } from "@acme/api";

import { authClient } from "./auth";
import { getBaseUrl } from "./base-url";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      // ...
    },
  },
});

const trpcUrl = `${getBaseUrl()}/api/trpc`;

function buildHeaders() {
  const headers = new Map<string, string>();
  headers.set("x-trpc-source", "expo-react");

  const cookies = authClient.getCookie();
  if (cookies) {
    headers.set("Cookie", cookies);
  }
  return headers;
}

/**
 * A set of typesafe hooks for consuming your API.
 *
 * Subscriptions are routed through `httpSubscriptionLink` (SSE under the hood)
 * so we can stream agent events from `verdict.run` to the client without a
 * websocket server. Everything else still goes over `httpBatchLink`.
 */
export const trpc = createTRPCOptionsProxy<AppRouter>({
  client: createTRPCClient({
    links: [
      loggerLink({
        enabled: (opts) =>
          process.env.NODE_ENV === "development" ||
          (opts.direction === "down" && opts.result instanceof Error),
        colorMode: "ansi",
      }),
      splitLink({
        condition: (op) => op.type === "subscription",
        true: httpSubscriptionLink({
          transformer: superjson,
          url: trpcUrl,
          // STUB: subscriptions are unauthenticated for now. When we move to
          // protectedProcedure we'll need eventSourceOptions to inject the
          // auth cookie via headers (react-native-sse supports that).
          EventSource:
            RNEventSource as unknown as typeof globalThis.EventSource,
        }),
        false: httpBatchLink({
          transformer: superjson,
          url: trpcUrl,
          headers: buildHeaders,
        }),
      }),
    ],
  }),
  queryClient,
});

export type { RouterInputs, RouterOutputs } from "@acme/api";
