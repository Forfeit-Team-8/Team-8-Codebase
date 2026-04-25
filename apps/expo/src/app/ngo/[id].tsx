import { Pressable, ScrollView, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Btn } from "~/promise/Btn";
import { C } from "~/promise/theme";
import { trpc } from "~/utils/api";

export default function NgoDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const ngoQuery = useQuery({
    ...trpc.ngo.byId.queryOptions({ id: id ?? "" }),
    enabled: !!id,
  });
  const d = ngoQuery.data;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      {d ? (
        <View
          style={{
            backgroundColor: d.accent,
            paddingHorizontal: 20,
            paddingTop: 14,
            paddingBottom: 28,
          }}
        >
          <Pressable
            onPress={() => router.back()}
            style={{
              backgroundColor: "rgba(255,255,255,0.16)",
              width: 36,
              height: 36,
              borderRadius: 18,
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 18,
            }}
          >
            <Text style={{ color: "#fff", fontSize: 20, fontWeight: "700" }}>
              ‹
            </Text>
          </Pressable>

          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 16,
              backgroundColor: "rgba(255,255,255,0.16)",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: 12,
            }}
          >
            <Text style={{ fontSize: 30 }}>{d.emoji}</Text>
          </View>

          <Text
            style={{
              color: "#fff",
              fontSize: 24,
              fontWeight: "800",
              letterSpacing: -0.6,
              lineHeight: 28,
            }}
          >
            {d.name}
          </Text>
          <Text
            style={{
              color: "#fff",
              opacity: 0.85,
              fontSize: 14,
              marginTop: 6,
              lineHeight: 20,
            }}
          >
            {d.tagline}
          </Text>

          <View
            style={{
              flexDirection: "row",
              flexWrap: "wrap",
              gap: 6,
              marginTop: 16,
            }}
          >
            {[
              { l: "Cause", v: d.cause },
              { l: "Founded", v: String(d.founded) },
              { l: "HQ", v: d.hq },
            ].map((m) => (
              <View
                key={m.l}
                style={{
                  backgroundColor: "rgba(255,255,255,0.14)",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 999,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 11 }}>
                  <Text style={{ opacity: 0.7 }}>{m.l} · </Text>
                  <Text style={{ fontWeight: "700" }}>{m.v}</Text>
                </Text>
              </View>
            ))}
          </View>
        </View>
      ) : null}

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {d ? (
          <>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 10,
                backgroundColor: "#fff",
                borderRadius: 14,
                padding: 14,
                borderWidth: 1,
                borderColor: C.line,
                marginBottom: 18,
              }}
            >
              <View
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: 8,
                  backgroundColor: C.chip,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 16 }}>✓</Text>
              </View>
              <View>
                <Text style={{ fontSize: 12, color: C.muted, fontWeight: "600" }}>
                  RATING
                </Text>
                <Text style={{ fontSize: 14, fontWeight: "700", color: C.ink }}>
                  {d.rating}
                </Text>
              </View>
            </View>

            <Text
              style={{
                fontSize: 12,
                color: C.muted,
                fontWeight: "600",
                letterSpacing: 0.6,
                marginBottom: 8,
              }}
            >
              ABOUT THE CAUSE
            </Text>

            {d.body.map((p, i) => (
              <Text
                key={i}
                style={{
                  fontSize: 14,
                  color: C.ink2,
                  lineHeight: 22,
                  marginBottom: 12,
                }}
              >
                {p}
              </Text>
            ))}

            <Text
              style={{
                marginTop: 20,
                marginBottom: 8,
                fontSize: 12,
                color: C.muted,
                fontWeight: "600",
                letterSpacing: 0.6,
              }}
            >
              BY THE NUMBERS
            </Text>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {d.impact.map((s, i) => (
                <View
                  key={i}
                  style={{
                    flex: 1,
                    backgroundColor: "#fff",
                    borderRadius: 14,
                    paddingVertical: 14,
                    paddingHorizontal: 10,
                    borderWidth: 1,
                    borderColor: C.line,
                    alignItems: "center",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "800",
                      color: d.accent,
                      letterSpacing: -0.4,
                    }}
                  >
                    {s.n}
                  </Text>
                  <Text
                    style={{
                      fontSize: 10,
                      color: C.ink2,
                      marginTop: 4,
                      lineHeight: 13,
                      textAlign: "center",
                    }}
                  >
                    {s.l}
                  </Text>
                </View>
              ))}
            </View>

            <View
              style={{
                marginTop: 22,
                padding: 14,
                borderRadius: 14,
                backgroundColor: C.chip,
                flexDirection: "row",
                gap: 10,
                alignItems: "flex-start",
              }}
            >
              <Text style={{ fontSize: 16 }}>📬</Text>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontSize: 12,
                    fontWeight: "700",
                    color: C.ink,
                    marginBottom: 4,
                  }}
                >
                  Where your forfeit goes
                </Text>
                <Text style={{ fontSize: 12, color: C.ink2, lineHeight: 18 }}>
                  {d.whereFundsGo}
                </Text>
              </View>
            </View>
          </>
        ) : null}
      </ScrollView>

      <View
        style={{
          paddingHorizontal: 20,
          paddingTop: 12,
          paddingBottom: 28,
          borderTopWidth: 1,
          borderTopColor: C.line,
          backgroundColor: C.bg,
        }}
      >
        <Btn kind="primary" onPress={() => router.back()}>
          {d ? `Pick ${d.name.split(" ")[0]} as my forfeit` : "Back"}
        </Btn>
      </View>
    </View>
  );
}
