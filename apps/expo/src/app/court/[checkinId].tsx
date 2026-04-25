import { useEffect, useRef, useState } from "react";
import { Animated, Pressable, Text, View } from "react-native";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import { useMutation } from "@tanstack/react-query";

import type { RouterOutputs } from "~/utils/api";
import { Character, IdleBob, PixelHeart } from "~/promise/PixelArt";
import { C } from "~/promise/theme";
import { trpc } from "~/utils/api";

type Script = RouterOutputs["court"]["startSession"]["script"];
type Turn = Script[number];

const SPEAKERS = {
  judge: { name: "JUDGE", color: "#7a3a18" },
  prosecutor: { name: "PROSECUTOR", color: "#9B2828" },
  defense: { name: "YOU", color: "#1a7d49" },
  narrator: { name: "COURT", color: "#444" },
} as const;

function useTypewriter(text: string, speed = 22) {
  const [shown, setShown] = useState("");
  useEffect(() => {
    setShown("");
    if (!text) return;
    let i = 0;
    const id = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) clearInterval(id);
    }, speed);
    return () => clearInterval(id);
  }, [text, speed]);
  return [shown, shown.length === (text || "").length] as const;
}

export default function Courtroom() {
  const { checkinId } = useLocalSearchParams<{ checkinId: string }>();
  const router = useRouter();

  const [script, setScript] = useState<Script | null>(null);
  const [step, setStep] = useState(0);
  const [credibility, setCredibility] = useState(5);
  const [shout, setShout] = useState<string | null>(null);
  const [choiceId, setChoiceId] = useState<string | undefined>();
  const [evidenceKind, setEvidenceKind] = useState<string | undefined>();
  const shakeAnim = useRef(new Animated.Value(0)).current;
  // Tracks the checkinId we've already kicked a session off for, so the
  // useEffect below fires exactly once per id. Without this, putting the
  // mutation object in deps caused a re-render loop that aborted every
  // in-flight request before onSuccess could run.
  const startedForRef = useRef<string | null>(null);

  const startSession = useMutation(trpc.court.startSession.mutationOptions());
  const finalize = useMutation(trpc.court.finalize.mutationOptions());

  useEffect(() => {
    if (!checkinId) return;
    if (startedForRef.current === checkinId) return;
    if (script) return;
    startedForRef.current = checkinId;
    startSession.mutate(
      { checkinId },
      { onSuccess: (data) => setScript(data.script) },
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkinId, script]);

  const retryStart = () => {
    startedForRef.current = null;
    startSession.reset();
    setScript(null);
  };

  const cur: Turn | undefined = script?.[step];
  const dialog = cur?.type === "speak" ? cur.text : "";
  const [typed, done] = useTypewriter(dialog);

  useEffect(() => {
    if (cur?.type === "speak" && cur.shout) {
      setShout(cur.shout);
      Animated.sequence([
        Animated.timing(shakeAnim, {
          toValue: 1,
          duration: 50,
          useNativeDriver: true,
        }),
        Animated.timing(shakeAnim, {
          toValue: 0,
          duration: 350,
          useNativeDriver: true,
        }),
      ]).start();
      const t = setTimeout(() => setShout(null), 850);
      return () => clearTimeout(t);
    }
  }, [step, cur, shakeAnim]);

  if (!script || !cur) {
    const errorMessage = startSession.error?.message;
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#000",
          padding: 24,
        }}
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={{ paddingTop: 56 }}>
          <Pressable
            onPress={() => router.back()}
            style={{
              alignSelf: "flex-start",
              backgroundColor: "rgba(255,255,255,0.12)",
              paddingHorizontal: 12,
              paddingVertical: 8,
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "#fff",
                fontSize: 11,
                letterSpacing: 0.5,
                fontWeight: "700",
              }}
            >
              ← FLEE
            </Text>
          </Pressable>
        </View>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          {errorMessage ? (
            <View style={{ alignItems: "center", maxWidth: 320 }}>
              <Text
                style={{
                  color: "#FF6B6B",
                  fontSize: 16,
                  fontWeight: "700",
                  marginBottom: 8,
                }}
              >
                Court refused to convene
              </Text>
              <Text
                style={{
                  color: "#fff",
                  fontSize: 13,
                  opacity: 0.8,
                  textAlign: "center",
                  marginBottom: 18,
                }}
              >
                {errorMessage}
              </Text>
              <Pressable
                onPress={retryStart}
                style={{
                  backgroundColor: C.accent,
                  paddingHorizontal: 18,
                  paddingVertical: 10,
                  borderRadius: 10,
                }}
              >
                <Text
                  style={{
                    color: C.ink,
                    fontWeight: "700",
                    fontSize: 14,
                  }}
                >
                  Retry
                </Text>
              </Pressable>
            </View>
          ) : (
            <Text style={{ color: "#fff", fontSize: 14 }}>
              Court is convening…
            </Text>
          )}
        </View>
      </View>
    );
  }

  const advance = () => {
    if (cur.type !== "speak") return;
    if (!done) return;
    if (step < script.length - 1) setStep(step + 1);
  };

  const pickChoice = (opt: { id: string; tone: "good" | "mid" | "bad" }) => {
    setChoiceId(opt.id);
    if (opt.tone === "bad") {
      setCredibility(0);
      // jump straight to verdict
      const verdictIdx = script.findIndex((t) => t.type === "verdict");
      setStep(verdictIdx);
    } else if (opt.tone === "mid") {
      setCredibility((c) => Math.max(1, c - 2));
      setStep(step + 1);
    } else {
      setStep(step + 1);
    }
  };

  const submitEvidence = (kind: string) => {
    setEvidenceKind(kind);
    if (kind === "none") setCredibility((c) => Math.max(0, c - 2));
    setTimeout(() => setStep(step + 1), 600);
  };

  const finalizeAndGo = () => {
    const won = credibility >= 3;
    finalize.mutate(
      {
        checkinId,
        won,
        credibility,
        choiceId,
        evidenceKind,
      },
      {
        onSuccess: () => {
          router.replace(`/verdict/${checkinId}?won=${won ? "1" : "0"}`);
        },
      },
    );
  };

  const speaker =
    cur.type === "speak" ? SPEAKERS[cur.speaker] : null;

  const shakeTransform = shakeAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 6],
  });

  return (
    <Animated.View
      style={{
        flex: 1,
        backgroundColor: "#000",
        transform: [{ translateX: shakeTransform }],
      }}
    >
      <Stack.Screen options={{ headerShown: false }} />

      {/* Backdrop */}
      <View
        style={{
          position: "absolute",
          inset: 0,
          backgroundColor: "#3a2517",
        }}
      />
      <View
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 0,
          height: "38%",
          backgroundColor: "#4a2d1c",
          borderTopWidth: 3,
          borderTopColor: "#1a0d05",
        }}
      />
      <View
        style={{
          position: "absolute",
          top: "50%",
          left: 0,
          right: 0,
          height: 8,
          backgroundColor: "#1a0d05",
        }}
      />

      {/* HUD top */}
      <View
        style={{
          position: "absolute",
          top: 56,
          left: 16,
          right: 16,
          zIndex: 10,
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Pressable
          onPress={() => router.back()}
          style={{
            backgroundColor: "rgba(0,0,0,0.5)",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, letterSpacing: 0.5, fontWeight: "700" }}>
            ← FLEE
          </Text>
        </Pressable>
        <View
          style={{
            backgroundColor: "rgba(0,0,0,0.6)",
            paddingHorizontal: 10,
            paddingVertical: 6,
            borderRadius: 8,
            flexDirection: "row",
            alignItems: "center",
            gap: 8,
          }}
        >
          <Text style={{ fontSize: 8, color: "#fff", fontWeight: "700", letterSpacing: 0.5 }}>
            CREDIBILITY
          </Text>
          <View style={{ flexDirection: "row", gap: 4 }}>
            {[1, 2, 3, 4, 5].map((i) => (
              <PixelHeart key={i} filled={i <= credibility} scale={2} />
            ))}
          </View>
        </View>
      </View>

      {/* Characters */}
      {cur.type === "speak" && cur.speaker === "judge" ? (
        <IdleBob
          style={{
            position: "absolute",
            top: 100,
            left: 0,
            right: 0,
            alignItems: "center",
          }}
        >
          <Character kind="judge" scale={5} />
        </IdleBob>
      ) : null}
      {cur.type === "speak" && cur.speaker === "prosecutor" ? (
        <IdleBob
          delay={1.3}
          style={{ position: "absolute", bottom: "38%", right: "6%" }}
        >
          <Character kind="prosecutor" scale={5} />
        </IdleBob>
      ) : null}
      {(cur.type === "speak" && cur.speaker === "defense") ||
      cur.type === "choice" ||
      cur.type === "evidence" ? (
        <IdleBob
          delay={0.7}
          style={{ position: "absolute", bottom: "38%", left: "6%" }}
        >
          <Character
            kind={
              cur.type === "speak" && cur.speaker === "defense"
                ? "defensePoint"
                : "defense"
            }
            scale={5}
          />
        </IdleBob>
      ) : null}

      {/* Shout overlay */}
      {shout ? (
        <View
          pointerEvents="none"
          style={{
            position: "absolute",
            inset: 0,
            zIndex: 30,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "rgba(0,0,0,0.35)",
          }}
        >
          <Text
            style={{
              fontSize: 38,
              color: "#FFD93C",
              fontWeight: "900",
              letterSpacing: 2,
              transform: [{ rotate: "-6deg" }],
              textShadowColor: "#B33A1B",
              textShadowOffset: { width: 4, height: 4 },
              textShadowRadius: 0,
            }}
          >
            {shout}
          </Text>
        </View>
      ) : null}

      {/* Dialog box */}
      {cur.type === "speak" ? (
        <Pressable
          onPress={advance}
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 24,
            zIndex: 15,
            backgroundColor: "#0a1a14",
            borderWidth: 3,
            borderColor: "#FFD166",
            borderRadius: 4,
            paddingTop: 20,
            paddingBottom: 16,
            paddingHorizontal: 16,
            minHeight: 110,
          }}
        >
          {speaker ? (
            <View
              style={{
                position: "absolute",
                top: -14,
                left: 16,
                backgroundColor: speaker.color,
                paddingHorizontal: 10,
                paddingVertical: 4,
                borderRadius: 6,
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 9,
                  letterSpacing: 0.5,
                  fontWeight: "700",
                }}
              >
                {speaker.name}
              </Text>
            </View>
          ) : null}
          <Text
            style={{
              fontSize: 18,
              lineHeight: 22,
              color: "#fff",
              letterSpacing: 0.5,
            }}
          >
            {typed}
            {!done ? "▌" : ""}
          </Text>
          {done ? (
            <Text
              style={{
                position: "absolute",
                bottom: 8,
                right: 12,
                fontSize: 8,
                color: "#FFD166",
                fontWeight: "700",
              }}
            >
              ▼ TAP
            </Text>
          ) : null}
        </Pressable>
      ) : null}

      {/* Choice prompt */}
      {cur.type === "choice" ? (
        <View
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 24,
            zIndex: 16,
            backgroundColor: "#0a1a14",
            borderWidth: 3,
            borderColor: "#FFD166",
            borderRadius: 4,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontSize: 9,
              color: "#FFD166",
              marginBottom: 10,
              letterSpacing: 0.5,
              fontWeight: "700",
            }}
          >
            ▸ {cur.prompt}
          </Text>
          <View style={{ gap: 6 }}>
            {cur.options.map((o) => (
              <Pressable
                key={o.id}
                onPress={() => pickChoice(o)}
                style={{
                  paddingHorizontal: 12,
                  paddingVertical: 10,
                  backgroundColor:
                    o.tone === "good"
                      ? "#1a7d49"
                      : o.tone === "mid"
                        ? "#7a4f12"
                        : "#7a1a1a",
                  borderRadius: 2,
                }}
              >
                <Text style={{ color: "#fff", fontSize: 16 }}>▸ {o.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* Evidence prompt */}
      {cur.type === "evidence" ? (
        <View
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 24,
            zIndex: 16,
            backgroundColor: "#0a1a14",
            borderWidth: 3,
            borderColor: "#FFD166",
            borderRadius: 4,
            padding: 12,
          }}
        >
          <Text
            style={{
              fontSize: 9,
              color: "#FFD166",
              marginBottom: 10,
              letterSpacing: 0.5,
              fontWeight: "700",
            }}
          >
            ▸ {cur.prompt}
          </Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6 }}>
            {cur.options.map((e) => (
              <Pressable
                key={e.id}
                onPress={() => submitEvidence(e.id)}
                style={{
                  width: "49%",
                  borderWidth: 2,
                  borderColor: "#FFD166",
                  paddingVertical: 10,
                  paddingHorizontal: 8,
                  backgroundColor: "#000",
                  borderRadius: 2,
                  alignItems: "center",
                  gap: 4,
                }}
              >
                <Text style={{ fontSize: 22 }}>{e.emoji}</Text>
                <Text style={{ fontSize: 14, color: "#FFD166" }}>{e.label}</Text>
              </Pressable>
            ))}
          </View>
        </View>
      ) : null}

      {/* Verdict trigger */}
      {cur.type === "verdict" ? (
        <View
          style={{
            position: "absolute",
            left: 14,
            right: 14,
            bottom: 24,
            zIndex: 16,
          }}
        >
          <Pressable
            onPress={finalizeAndGo}
            disabled={finalize.isPending}
            style={{
              paddingVertical: 16,
              backgroundColor: "#FFD166",
              borderWidth: 3,
              borderColor: "#000",
              alignItems: "center",
            }}
          >
            <Text
              style={{
                fontSize: 14,
                color: "#1a0d05",
                fontWeight: "900",
                letterSpacing: 1,
              }}
            >
              ▶ HEAR THE VERDICT
            </Text>
          </Pressable>
        </View>
      ) : null}
    </Animated.View>
  );
}
