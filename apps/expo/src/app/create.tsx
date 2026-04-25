import type { Dispatch, SetStateAction } from "react";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { Stack, useRouter } from "expo-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Slider } from "heroui-native";

import { Btn } from "~/promise/Btn";
import { BackButton, TopBar } from "~/promise/TopBar";
import { C } from "~/promise/theme";
import { trpc } from "~/utils/api";

const DURATIONS = [7, 14, 28, 60] as const;
const STAKE_PRESETS = [10, 20, 30, 50] as const;

export default function CreatePact() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [paying, setPaying] = useState(false);
  const [title, setTitle] = useState("Run 5km every day");
  const [duration, setDuration] = useState<number>(28);
  const [ngoId, setNgoId] = useState<string>("ocean");
  const [stake, setStake] = useState<number>(30);

  const ngosQuery = useQuery(trpc.ngo.list.queryOptions());
  const ngos = ngosQuery.data ?? [];
  const ngo = ngos.find((n) => n.id === ngoId) ?? ngos[0];

  const createMutation = useMutation({
    ...trpc.pact.create.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(trpc.pact.list.queryFilter());
        await queryClient.invalidateQueries(trpc.pact.stats.queryFilter());
      },
    }),
  });

  const goBack = () => {
    if (paying) {
      setPaying(false);
      return;
    }
    if (step === 1) {
      router.back();
      return;
    }
    setStep(((step - 1) as 1 | 2 | 3));
  };

  const goNext = () => {
    if (step < 3) {
      setStep(((step + 1) as 1 | 2 | 3));
      return;
    }
    if (!paying) {
      setPaying(true);
      return;
    }
    if (!ngo) return;
    createMutation.mutate(
      {
        title,
        durationDays: duration,
        ngoId: ngo.id,
        stakeCents: stake * 100,
      },
      {
        onSuccess: () => {
          router.replace("/");
        },
      },
    );
  };

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      <TopBar
        title={paying ? "Confirm payment" : `Step ${step} of 3`}
        leading={<BackButton onPress={goBack} />}
        trailing={
          !paying ? (
            <Text style={{ fontSize: 13, color: C.muted, fontWeight: "600" }}>
              Skip
            </Text>
          ) : null
        }
      />

      <View
        style={{
          flexDirection: "row",
          gap: 6,
          paddingHorizontal: 20,
          paddingBottom: 8,
        }}
      >
        {[1, 2, 3].map((s) => (
          <View
            key={s}
            style={{
              flex: 1,
              height: 4,
              borderRadius: 2,
              backgroundColor: s <= step ? C.ink : C.line,
            }}
          />
        ))}
      </View>

      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ padding: 20, paddingBottom: 40 }}
      >
        {step === 1 && !paying ? (
          <Step1
            title={title}
            setTitle={setTitle}
            duration={duration}
            setDuration={setDuration}
          />
        ) : null}

        {step === 2 && !paying ? (
          <Step2
            ngos={ngos}
            ngoId={ngoId}
            setNgoId={setNgoId}
            onTapInfo={(id: string) => router.push(`/ngo/${id}`)}
          />
        ) : null}

        {step === 3 && !paying ? (
          <Step3
            stake={stake}
            setStake={setStake}
            duration={duration}
            ngoName={ngo?.name ?? ""}
          />
        ) : null}

        {paying ? (
          <PaymentStep
            title={title}
            stake={stake}
            duration={duration}
            ngoName={ngo?.name ?? ""}
          />
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
        <Btn
          kind={paying ? "green" : "primary"}
          onPress={goNext}
          disabled={createMutation.isPending}
        >
          {paying
            ? `Authorize $${stake} & sign pact 🤝`
            : step === 3
              ? `Continue · $${stake}`
              : "Continue"}
        </Btn>
      </View>
    </View>
  );
}

interface Step1Props {
  title: string;
  setTitle: Dispatch<SetStateAction<string>>;
  duration: number;
  setDuration: Dispatch<SetStateAction<number>>;
}
function Step1({ title, setTitle, duration, setDuration }: Step1Props) {
  return (
    <View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: C.ink,
          letterSpacing: -0.6,
          lineHeight: 30,
        }}
      >
        {"What are you\npromising yourself?"}
      </Text>
      <Text style={{ fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
        Make it specific. The AI will need to verify it.
      </Text>

      <Card>
        <TextInput
          value={title}
          onChangeText={setTitle}
          multiline
          numberOfLines={2}
          maxLength={120}
          placeholder="e.g. Run 5km every day"
          placeholderTextColor={C.muted}
          style={{
            fontSize: 18,
            fontWeight: "600",
            color: C.ink,
            lineHeight: 24,
          }}
        />
        <View
          style={{
            marginTop: 8,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Text style={{ fontSize: 11, color: C.muted }}>
            {title.length}/120
          </Text>
          <Text style={{ fontSize: 11, color: C.muted }}>👁 AI sees this</Text>
        </View>
      </Card>

      <Text
        style={{
          marginTop: 22,
          marginBottom: 8,
          fontSize: 12,
          color: C.muted,
          fontWeight: "600",
          letterSpacing: 0.6,
        }}
      >
        HOW LONG?
      </Text>
      <View style={{ flexDirection: "row", gap: 8 }}>
        {DURATIONS.map((d) => {
          const selected = duration === d;
          return (
            <Pressable
              key={d}
              onPress={() => setDuration(d)}
              style={{
                flex: 1,
                paddingVertical: 14,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: selected ? C.ink : C.line,
                backgroundColor: selected ? C.ink : "#fff",
                alignItems: "center",
              }}
            >
              <Text
                style={{
                  color: selected ? "#fff" : C.ink,
                  fontWeight: "700",
                  fontSize: 15,
                }}
              >
                {d}
                <Text
                  style={{
                    opacity: 0.7,
                    fontWeight: "500",
                    fontSize: 12,
                  }}
                >
                  d
                </Text>
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface NgoListItem {
  id: string;
  name: string;
  emoji: string;
  tag: string;
}
interface Step2Props {
  ngos: NgoListItem[];
  ngoId: string;
  setNgoId: Dispatch<SetStateAction<string>>;
  onTapInfo: (id: string) => void;
}
function Step2({ ngos, ngoId, setNgoId, onTapInfo }: Step2Props) {
  return (
    <View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: C.ink,
          letterSpacing: -0.6,
          lineHeight: 30,
        }}
      >
        {"If you fail,\nwho gets the cash?"}
      </Text>
      <Text style={{ fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
        Pick a cause. We forward 100% — no fees on forfeits.
      </Text>

      <View style={{ gap: 8 }}>
        {ngos.map((n) => {
          const selected = ngoId === n.id;
          return (
            <Pressable
              key={n.id}
              onPress={() => setNgoId(n.id)}
              style={{
                borderWidth: selected ? 2 : 1.5,
                borderColor: selected ? C.ink : C.line,
                backgroundColor: "#fff",
                padding: 14,
                borderRadius: 18,
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: 12,
                  backgroundColor: C.chip,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text style={{ fontSize: 20 }}>{n.emoji}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 15,
                    color: C.ink,
                  }}
                >
                  {n.name}
                </Text>
                <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
                  {n.tag}
                </Text>
              </View>
              <Pressable
                onPress={(e) => {
                  e.stopPropagation();
                  onTapInfo(n.id);
                }}
                hitSlop={8}
                style={{
                  width: 30,
                  height: 30,
                  borderRadius: 15,
                  borderWidth: 1.5,
                  borderColor: C.line,
                  backgroundColor: "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Text
                  style={{
                    fontWeight: "700",
                    fontSize: 14,
                    color: C.ink2,
                    fontStyle: "italic",
                  }}
                >
                  i
                </Text>
              </Pressable>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 11,
                  borderWidth: 2,
                  borderColor: selected ? C.ink : C.line,
                  backgroundColor: selected ? C.ink : "#fff",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {selected ? (
                  <Text style={{ color: "#fff", fontSize: 11, fontWeight: "700" }}>
                    ✓
                  </Text>
                ) : null}
              </View>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}

interface Step3Props {
  stake: number;
  setStake: Dispatch<SetStateAction<number>>;
  duration: number;
  ngoName: string;
}
function Step3({ stake, setStake, duration, ngoName }: Step3Props) {
  return (
    <View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: C.ink,
          letterSpacing: -0.6,
          lineHeight: 30,
        }}
      >
        {"How much\nare you willing to lose?"}
      </Text>
      <Text style={{ fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
        If you fail, this goes to{" "}
        <Text style={{ color: C.ink, fontWeight: "700" }}>{ngoName}</Text>.
        Pick a number that stings just enough.
      </Text>

      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 22,
          padding: 24,
          alignItems: "center",
        }}
      >
        <Text style={{ fontSize: 13, color: C.muted, fontWeight: "600" }}>
          STAKE
        </Text>
        <Text
          style={{
            fontSize: 64,
            fontWeight: "800",
            color: C.ink,
            letterSpacing: -2,
            marginTop: 4,
          }}
        >
          <Text style={{ fontSize: 28 }}>$</Text>
          {stake}
        </Text>
        <Text style={{ fontSize: 12, color: C.muted, marginTop: 6 }}>
          ≈ ${(stake / duration).toFixed(2)} per day on the line
        </Text>

        <View style={{ width: "100%", marginTop: 18 }}>
          <Slider
            value={stake}
            minValue={5}
            maxValue={50}
            step={5}
            onChange={(v) =>
              setStake(typeof v === "number" ? v : (v[0] ?? stake))
            }
          >
            <Slider.Track>
              <Slider.Fill />
              <Slider.Thumb />
            </Slider.Track>
          </Slider>
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              marginTop: 4,
            }}
          >
            <Text style={{ fontSize: 11, color: C.muted, fontWeight: "500" }}>
              $5
            </Text>
            <Text style={{ fontSize: 11, color: C.muted, fontWeight: "500" }}>
              $50
            </Text>
          </View>
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 8, marginTop: 14 }}>
        {STAKE_PRESETS.map((v) => {
          const selected = stake === v;
          return (
            <Pressable
              key={v}
              onPress={() => setStake(v)}
              style={{
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                borderWidth: 1.5,
                borderColor: selected ? C.ink : C.line,
                backgroundColor: selected ? C.accent : "#fff",
                alignItems: "center",
              }}
            >
              <Text style={{ color: C.ink, fontWeight: "700", fontSize: 14 }}>
                ${v}
              </Text>
            </Pressable>
          );
        })}
      </View>

      <View
        style={{
          marginTop: 22,
          padding: 14,
          borderRadius: 16,
          backgroundColor: C.chipWarm,
          flexDirection: "row",
          gap: 10,
          alignItems: "flex-start",
        }}
      >
        <Text style={{ fontSize: 18 }}>💳</Text>
        <Text
          style={{
            flex: 1,
            fontSize: 13,
            color: "#7a4f12",
            lineHeight: 18,
          }}
        >
          We hold ${stake} on your card for {duration} days. Complete the pact
          and it's released. Fail and it goes to {ngoName}.
        </Text>
      </View>
    </View>
  );
}

interface PaymentStepProps {
  title: string;
  stake: number;
  duration: number;
  ngoName: string;
}
function PaymentStep({ title, stake, duration, ngoName }: PaymentStepProps) {
  return (
    <View>
      <Text
        style={{
          fontSize: 26,
          fontWeight: "700",
          color: C.ink,
          letterSpacing: -0.6,
          lineHeight: 30,
        }}
      >
        {"Lock in\nyour stake"}
      </Text>
      <Text style={{ fontSize: 14, color: C.ink2, marginTop: 8, marginBottom: 20 }}>
        We'll authorize ${stake} now. You're not charged unless you fail.
      </Text>

      <View
        style={{
          backgroundColor: C.ink,
          borderRadius: 18,
          padding: 18,
          marginBottom: 16,
        }}
      >
        <Text
          style={{
            fontSize: 11,
            opacity: 0.6,
            color: "#fff",
            fontWeight: "600",
            letterSpacing: 0.6,
          }}
        >
          THE PACT
        </Text>
        <Text
          style={{
            fontSize: 17,
            fontWeight: "700",
            color: "#fff",
            marginTop: 4,
            lineHeight: 22,
          }}
        >
          "{title}"
        </Text>
        <View
          style={{
            height: 1,
            backgroundColor: "rgba(255,255,255,0.1)",
            marginVertical: 14,
          }}
        />
        <ReceiptRow label="Duration" value={`${duration} days`} />
        <ReceiptRow label="Forfeit to" value={ngoName} />
        <ReceiptRow label="Stake" value={`$${stake}.00`} bold />
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
        PAYMENT METHOD
      </Text>
      <View
        style={{
          backgroundColor: "#fff",
          borderRadius: 18,
          padding: 14,
          flexDirection: "row",
          alignItems: "center",
          gap: 12,
          borderWidth: 2,
          borderColor: C.ink,
        }}
      >
        <View
          style={{
            width: 44,
            height: 30,
            borderRadius: 6,
            backgroundColor: "#1a1a1a",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Text style={{ color: "#fff", fontSize: 9, fontWeight: "800", letterSpacing: 0.5 }}>
            VISA
          </Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={{ fontWeight: "600", fontSize: 14, color: C.ink }}>
            •••• •••• •••• 4242
          </Text>
          <Text style={{ fontSize: 12, color: C.muted, marginTop: 1 }}>
            Expires 08/29
          </Text>
        </View>
        <Text style={{ fontSize: 13, color: C.primary, fontWeight: "600" }}>
          Change
        </Text>
      </View>

      <Text
        style={{
          marginTop: 18,
          fontSize: 11,
          color: C.muted,
          lineHeight: 16,
          textAlign: "center",
          paddingHorizontal: 8,
        }}
      >
        By signing, you authorize Promise to hold ${stake} until{" "}
        {duration === 7 ? "next week" : `${duration} days from now`}. Funds
        released on success, transferred to {ngoName} on failure. No fees.
      </Text>
    </View>
  );
}

function ReceiptRow({
  label,
  value,
  bold,
}: {
  label: string;
  value: string;
  bold?: boolean;
}) {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "space-between",
        marginBottom: 8,
      }}
    >
      <Text style={{ color: "#fff", opacity: 0.6, fontSize: 13 }}>{label}</Text>
      <Text
        style={{
          color: "#fff",
          fontSize: bold ? 16 : 13,
          fontWeight: bold ? "800" : "600",
        }}
      >
        {value}
      </Text>
    </View>
  );
}

function Card({ children }: { children: React.ReactNode }) {
  return (
    <View
      style={{
        backgroundColor: "#fff",
        borderRadius: 22,
        padding: 14,
      }}
    >
      {children}
    </View>
  );
}
