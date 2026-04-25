import { ScrollView, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation, useQuery } from "@tanstack/react-query";

import { Btn } from "~/promise/Btn";
import { Chip } from "~/promise/Chip";
import { Character } from "~/promise/PixelArt";
import { C } from "~/promise/theme";
import { BackButton, TopBar } from "~/promise/TopBar";
import { trpc } from "~/utils/api";

function dollars(cents: number) {
  return `$${Math.round(cents / 100)}`;
}

export default function PactDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const detailQuery = useQuery({
    ...trpc.pact.byId.queryOptions({ pactId: id }),
    enabled: !!id,
  });

  const startCheckin = useMutation(
    trpc.pact.todayCheckin.mutationOptions({
      onSuccess: (checkin) => {
        router.push(`/court/${checkin.id}`);
      },
    }),
  );

  const data = detailQuery.data;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      <TopBar
        title="Pact details"
        leading={<BackButton onPress={() => router.back()} />}
        trailing={<Text style={{ fontSize: 18, color: C.ink2 }}>⋯</Text>}
      />

      <ScrollView contentContainerStyle={{ paddingBottom: 60 }}>
        {data ? (
          <>
            <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
              <View
                style={{
                  backgroundColor: "#fff",
                  borderRadius: 22,
                  padding: 18,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                  }}
                >
                  <View
                    style={{
                      width: 56,
                      height: 56,
                      borderRadius: 16,
                      backgroundColor: C.chip,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text style={{ fontSize: 28 }}>
                      {data.ngo?.emoji ?? "🎯"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Chip tone="warm">DUE TODAY · 9:00 PM</Chip>
                    <Text
                      style={{
                        fontSize: 17,
                        fontWeight: "700",
                        color: C.ink,
                        marginTop: 6,
                        lineHeight: 22,
                      }}
                    >
                      {data.pact.title}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: C.muted, marginTop: 2 }}
                    >
                      {dollars(data.pact.stakeCents)} → {data.ngo?.name ?? ""}
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 18 }}>
                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                      marginBottom: 6,
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        fontWeight: "600",
                        letterSpacing: 0.4,
                      }}
                    >
                      DAY {data.completedDays} OF {data.pact.durationDays}
                    </Text>
                    <Text
                      style={{
                        fontSize: 11,
                        color: C.muted,
                        fontWeight: "600",
                        letterSpacing: 0.4,
                      }}
                    >
                      {Math.max(0, data.pact.durationDays - data.completedDays)}{" "}
                      DAYS TO GO
                    </Text>
                  </View>
                  <View
                    style={{
                      height: 8,
                      borderRadius: 4,
                      backgroundColor: C.line,
                      overflow: "hidden",
                    }}
                  >
                    <View
                      style={{
                        height: "100%",
                        width: `${Math.min(100, (data.completedDays / Math.max(1, data.pact.durationDays)) * 100)}%`,
                        backgroundColor: C.primary,
                      }}
                    />
                  </View>
                </View>

                <View
                  style={{
                    flexDirection: "row",
                    justifyContent: "space-between",
                    marginTop: 14,
                  }}
                >
                  <Text style={{ fontSize: 12 }}>
                    <Text style={{ color: C.muted }}>Streak </Text>
                    <Text style={{ color: C.ink, fontWeight: "700" }}>
                      {data.completedDays} days 🔥
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <Text style={{ color: C.muted }}>At stake </Text>
                    <Text style={{ color: C.ink, fontWeight: "700" }}>
                      {dollars(data.pact.stakeCents)}
                    </Text>
                  </Text>
                  <Text style={{ fontSize: 12 }}>
                    <Text style={{ color: C.muted }}>Forfeit to </Text>
                    <Text style={{ color: C.ink, fontWeight: "700" }}>
                      {data.ngo?.name.split(" ")[0] ?? "—"}
                    </Text>
                  </Text>
                </View>
              </View>
            </View>

            <Text
              style={{
                paddingHorizontal: 20,
                paddingTop: 20,
                paddingBottom: 8,
                fontSize: 13,
                fontWeight: "700",
                color: C.muted,
                letterSpacing: 0.6,
              }}
            >
              TODAY'S CHECK-IN
            </Text>

            <View style={{ paddingHorizontal: 20 }}>
              <View
                style={{
                  padding: 18,
                  borderRadius: 22,
                  backgroundColor: "#FFE9C2",
                  borderWidth: 1.5,
                  borderColor: C.accent,
                }}
              >
                <View
                  style={{
                    flexDirection: "row",
                    gap: 12,
                    alignItems: "flex-start",
                  }}
                >
                  <Character kind="judge" scale={2} />
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{
                        fontSize: 9,
                        color: "#A4691B",
                        marginBottom: 4,
                        letterSpacing: 0.5,
                        fontWeight: "700",
                      }}
                    >
                      THE COURT AWAITS
                    </Text>
                    <Text
                      style={{
                        fontSize: 16,
                        fontWeight: "700",
                        color: "#5A3A0E",
                        lineHeight: 21,
                      }}
                    >
                      Did you {data.pact.title.toLowerCase()} today?
                    </Text>
                    <Text
                      style={{
                        fontSize: 13,
                        color: "#7a4f12",
                        marginTop: 4,
                        lineHeight: 18,
                      }}
                    >
                      The AI prosecutor will ask you a few questions. Have your
                      evidence ready.
                    </Text>
                  </View>
                </View>

                <View style={{ marginTop: 14 }}>
                  <Btn
                    kind="primary"
                    onPress={() =>
                      startCheckin.mutate({ pactId: data.pact.id })
                    }
                    disabled={startCheckin.isPending}
                  >
                    Take the stand →
                  </Btn>
                </View>
              </View>
            </View>

            <Text
              style={{
                paddingHorizontal: 20,
                paddingTop: 24,
                paddingBottom: 8,
                fontSize: 13,
                fontWeight: "700",
                color: C.muted,
                letterSpacing: 0.6,
              }}
            >
              RECENT VERDICTS
            </Text>
            <View style={{ paddingHorizontal: 20, gap: 8 }}>
              {data.recent.length === 0 ? (
                <Text style={{ fontSize: 13, color: C.muted }}>
                  No verdicts yet. The first check-in writes here.
                </Text>
              ) : null}
              {data.recent.map((r) => (
                <View
                  key={r.id}
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 12,
                    backgroundColor: "#fff",
                    paddingHorizontal: 14,
                    paddingVertical: 12,
                    borderRadius: 14,
                  }}
                >
                  <View
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: 10,
                      backgroundColor:
                        r.status === "acquitted" ? C.chip : C.chipDanger,
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  >
                    <Text
                      style={{
                        color: r.status === "acquitted" ? C.primary : "#9a3340",
                        fontWeight: "700",
                        fontSize: 14,
                      }}
                    >
                      {r.status === "acquitted"
                        ? "✓"
                        : r.status === "guilty"
                          ? "✗"
                          : "–"}
                    </Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text
                      style={{ fontWeight: "600", fontSize: 14, color: C.ink }}
                    >
                      {r.status === "acquitted"
                        ? "Acquitted"
                        : r.status === "guilty"
                          ? "Guilty"
                          : "Pending"}
                    </Text>
                    <Text
                      style={{ fontSize: 12, color: C.muted, marginTop: 1 }}
                    >
                      Day {r.dayNumber}
                    </Text>
                  </View>
                  <Text
                    style={{ fontSize: 12, color: C.muted, fontWeight: "500" }}
                  >
                    {new Date(r.createdAt).toLocaleDateString()}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}
