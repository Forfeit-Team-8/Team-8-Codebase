import { useEffect, useRef, useState } from "react";
import { Animated, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Btn } from "~/promise/Btn";
import { Character, IdleBob } from "~/promise/PixelArt";
import { C } from "~/promise/theme";
import { trpc } from "~/utils/api";

export default function Verdict() {
  const { checkinId, won: wonParam } = useLocalSearchParams<{
    checkinId: string;
    won?: string;
  }>();
  const router = useRouter();
  const won = wonParam === "1";

  const [reveal, setReveal] = useState(false);
  const reveal0 = useRef(new Animated.Value(0)).current;
  const reveal1 = useRef(new Animated.Value(0)).current;

  // The pact / NGO / stake context — we look up via list because we don't
  // have the pact id directly. For the slice this is fine; the verdict only
  // really needs the won flag and the stake/NGO from the latest active pact.
  const pactsQuery = useQuery(trpc.pact.list.queryOptions());
  const pact = pactsQuery.data?.[0];

  useEffect(() => {
    const t = setTimeout(() => {
      setReveal(true);
      Animated.parallel([
        Animated.spring(reveal0, {
          toValue: 1,
          useNativeDriver: true,
          friction: 4,
          tension: 80,
        }),
        Animated.timing(reveal1, {
          toValue: 1,
          duration: 500,
          delay: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }, 600);
    return () => clearTimeout(t);
  }, [reveal0, reveal1]);

  const stake = pact ? `$${Math.round(pact.stakeCents / 100)}` : "$30";
  const ngoName = pact?.ngoName ?? "the cause";

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: won ? "#0d2a1c" : "#2a0a0a",
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* curtains */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          bottom: 0,
          width: "20%",
          backgroundColor: "#1a0d05",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: 0,
          right: 0,
          bottom: 0,
          width: "20%",
          backgroundColor: "#1a0d05",
        }}
      />

      {/* Big shout */}
      <Animated.View
        style={{
          position: "absolute",
          top: "14%",
          left: 0,
          right: 0,
          alignItems: "center",
          opacity: reveal0,
          transform: [
            {
              scale: reveal0.interpolate({
                inputRange: [0, 1],
                outputRange: [0.3, 1],
              }),
            },
            { rotate: "-3deg" },
          ],
        }}
      >
        <Text
          style={{
            fontSize: 36,
            color: won ? "#FFD93C" : "#FF6B6B",
            fontWeight: "900",
            letterSpacing: 2,
            textShadowColor: won ? "#1a7d49" : "#7a1a1a",
            textShadowOffset: { width: 4, height: 4 },
            textShadowRadius: 0,
          }}
        >
          {won ? "NOT GUILTY!" : "GUILTY!"}
        </Text>
        <Text
          style={{
            marginTop: 12,
            fontSize: 18,
            color: "#fff",
            letterSpacing: 1,
          }}
        >
          {won
            ? "☆ The court rules in your favor ☆"
            : "⚠ The court has ruled ⚠"}
        </Text>
      </Animated.View>

      {/* Character */}
      {reveal ? (
        <View
          style={{
            position: "absolute",
            bottom: "32%",
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <IdleBob amp={3}>
            <Character kind={won ? "defensePoint" : "judge"} scale={6} />
          </IdleBob>
        </View>
      ) : null}

      {/* Result panel */}
      <Animated.View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          padding: 16,
          paddingBottom: 32,
          backgroundColor: "rgba(0,0,0,0.7)",
          opacity: reveal1,
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            borderRadius: 22,
            padding: 18,
          }}
        >
          <Text
            style={{
              fontSize: 9,
              color: won ? "#1a7d49" : "#9a3340",
              letterSpacing: 0.6,
              marginBottom: 8,
              fontWeight: "700",
            }}
          >
            {won ? "— STREAK +1 —" : "— PACT BROKEN —"}
          </Text>

          {won ? (
            <>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: C.ink,
                  lineHeight: 26,
                  letterSpacing: -0.4,
                }}
              >
                Your {stake} is safe.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: C.ink2,
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                Day saved. Keep this up and that money walks back to you,
                untouched. The prosecutor is fuming.
              </Text>
              <View
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: C.chip,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#1a7d49",
                    fontWeight: "600",
                  }}
                >
                  STREAK
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: C.ink,
                  }}
                >
                  +1 day 🔥
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text
                style={{
                  fontSize: 22,
                  fontWeight: "700",
                  color: C.ink,
                  lineHeight: 26,
                  letterSpacing: -0.4,
                }}
              >
                {stake} forfeited to {ngoName}.
              </Text>
              <Text
                style={{
                  fontSize: 14,
                  color: C.ink2,
                  marginTop: 6,
                  lineHeight: 19,
                }}
              >
                The pact is dissolved. On the bright side — that's a real
                cause getting a real boost. You can start again whenever
                you're ready.
              </Text>
              <View
                style={{
                  marginTop: 14,
                  padding: 12,
                  borderRadius: 12,
                  backgroundColor: C.chipDanger,
                  flexDirection: "row",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    fontSize: 12,
                    color: "#9a3340",
                    fontWeight: "600",
                  }}
                >
                  TRANSFER
                </Text>
                <Text
                  style={{
                    fontSize: 18,
                    fontWeight: "800",
                    color: C.ink,
                  }}
                >
                  {stake} → {ngoName}
                </Text>
              </View>
            </>
          )}

          <View style={{ marginTop: 14, gap: 8 }}>
            <Btn
              kind={won ? "green" : "primary"}
              onPress={() => router.replace("/")}
            >
              {won ? "Back to my pacts" : "Make a new promise"}
            </Btn>
          </View>
        </View>
      </Animated.View>
    </View>
  );
}
