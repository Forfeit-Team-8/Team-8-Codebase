import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Btn } from "~/promise/Btn";
import { TabBar } from "~/promise/TabBar";
import { C } from "~/promise/theme";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

function dollars(cents: number) {
  return `$${Math.round(cents / 100)}`;
}

function statusDot(status: string, dayNumber: number, total: number) {
  if (dayNumber >= total) return C.muted;
  if (status === "active" && dayNumber === 0) return C.muted;
  // simple heuristic for the design's "due" / "on-track" / "pending" dots
  if (status === "pending" || dayNumber === 0) return C.muted;
  return C.primary;
}

function useEnsureSignedIn() {
  const { data: session, isPending } = authClient.useSession();
  const signingInRef = useRef(false);
  useEffect(() => {
    if (isPending || session || signingInRef.current) return;
    signingInRef.current = true;
    void authClient.signIn
      .anonymous()
      .then(async () => {
        const guestName = `Guest ${Math.floor(Math.random() * 9000) + 1000}`;
        await authClient.updateUser({ name: guestName });
      })
      .finally(() => {
        signingInRef.current = false;
      });
  }, [isPending, session]);
  return session;
}

export default function Home() {
  const router = useRouter();
  const session = useEnsureSignedIn();

  const pactsQuery = useQuery({
    ...trpc.pact.list.queryOptions(),
    enabled: !!session,
  });
  const statsQuery = useQuery({
    ...trpc.pact.stats.queryOptions(),
    enabled: !!session,
  });

  const totalAtStakeCents = statsQuery.data?.totalAtStakeCents ?? 0;
  const pacts = pactsQuery.data ?? [];

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        <View
          style={{
            paddingTop: 64,
            paddingBottom: 8,
            paddingHorizontal: 24,
            flexDirection: "row",
            alignItems: "baseline",
            justifyContent: "space-between",
          }}
        >
          <Text
            style={{
              fontSize: 22,
              fontWeight: "700",
              color: C.ink,
              letterSpacing: -0.6,
            }}
          >
            Promise
          </Text>
          <Text style={{ fontSize: 13, color: C.muted, fontWeight: "500" }}>
            <Text style={{ color: C.ink, fontWeight: "700" }}>
              {dollars(totalAtStakeCents)}
            </Text>{" "}
            on the line
          </Text>
        </View>

        <View style={{ paddingTop: 24, paddingHorizontal: 8 }}>
          {pacts.length === 0 && !pactsQuery.isPending ? (
            <View
              style={{
                paddingVertical: 60,
                paddingHorizontal: 24,
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "600",
                  color: C.ink2,
                  textAlign: "center",
                }}
              >
                No pacts yet.
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  color: C.muted,
                  marginTop: 6,
                  textAlign: "center",
                }}
              >
                Make your first promise — pick a goal, stake some cash, and
                let the courtroom keep you honest.
              </Text>
            </View>
          ) : null}

          {pacts.map((p, i) => {
            const dot = statusDot(p.status, p.completedDays, p.durationDays);
            return (
              <Pressable
                key={p.id}
                onPress={() => router.push(`/pact/${p.id}`)}
                style={({ pressed }) => ({
                  opacity: pressed ? 0.7 : 1,
                  paddingHorizontal: 16,
                  paddingVertical: 18,
                  borderTopWidth: i === 0 ? 1 : 0,
                  borderTopColor: C.line,
                  borderBottomWidth: 1,
                  borderBottomColor: C.line,
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 14,
                })}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: dot,
                  }}
                />
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "600",
                      color: C.ink,
                      letterSpacing: -0.2,
                    }}
                  >
                    {p.title}
                  </Text>
                  <Text style={{ fontSize: 12, color: C.muted, marginTop: 4 }}>
                    Day {p.completedDays} of {p.durationDays}
                    {p.status === "forfeited" ? " · forfeited" : ""}
                  </Text>
                </View>
                <Text
                  style={{
                    fontSize: 17,
                    fontWeight: "700",
                    color: C.ink,
                  }}
                >
                  {dollars(p.stakeCents)}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={{ paddingTop: 28, paddingHorizontal: 20 }}>
          <Btn kind="primary" onPress={() => router.push("/create")}>
            New pact
          </Btn>
        </View>

        {/* STUB: temporary entry to the standalone Claude verifier debug
            screen. Lives parallel to the court-flow UI until the two
            verdict systems are reconciled. Remove once the agent is wired
            into the real court flow. */}
        <View style={{ paddingTop: 16, alignItems: "center" }}>
          <Pressable onPress={() => router.push("/agent-debug")}>
            <Text style={{ fontSize: 12, color: C.muted }}>
              · agent debug ·
            </Text>
          </Pressable>
        </View>
      </ScrollView>

      <TabBar
        active="home"
        onSelect={(t) => {
          if (t === "home") return;
          if (t === "create") router.push("/create");
          if (t === "me") router.push("/me");
        }}
      />
    </View>
  );
}
