import { ScrollView, Text, View } from "react-native";
import { Stack, useRouter } from "expo-router";
import { useQuery } from "@tanstack/react-query";

import { Btn } from "~/promise/Btn";
import { Chip } from "~/promise/Chip";
import { TabBar } from "~/promise/TabBar";
import { C } from "~/promise/theme";
import { trpc } from "~/utils/api";
import { authClient } from "~/utils/auth";

function dollars(cents: number) {
  return `$${Math.round(cents / 100)}`;
}

function initials(name?: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() ?? "").join("") || "?";
}

export default function Me() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const statsQuery = useQuery({
    ...trpc.pact.stats.queryOptions(),
    enabled: !!session,
  });

  const stats = statsQuery.data;
  const name = session?.user.name ?? "Signing in…";
  const isAnon = (session?.user as { isAnonymous?: boolean } | undefined)
    ?.isAnonymous;

  return (
    <View style={{ flex: 1, backgroundColor: C.bg }}>
      <Stack.Screen options={{ headerShown: false }} />

      <ScrollView contentContainerStyle={{ paddingBottom: 110 }}>
        {/* Header */}
        <View
          style={{
            paddingTop: 64,
            paddingHorizontal: 24,
            paddingBottom: 8,
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
            Profile
          </Text>
        </View>

        {/* Identity card */}
        <View style={{ paddingHorizontal: 20, paddingTop: 12 }}>
          <View
            style={{
              backgroundColor: "#fff",
              borderRadius: 22,
              padding: 18,
              flexDirection: "row",
              alignItems: "center",
              gap: 14,
            }}
          >
            <View
              style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: C.ink,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  color: "#fff",
                  fontSize: 22,
                  fontWeight: "800",
                  letterSpacing: -0.5,
                }}
              >
                {initials(session?.user.name)}
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontSize: 18,
                  fontWeight: "700",
                  color: C.ink,
                  letterSpacing: -0.3,
                }}
              >
                {name}
              </Text>
              <View style={{ marginTop: 6, flexDirection: "row" }}>
                <Chip tone={isAnon ? "warm" : "green"}>
                  {isAnon ? "Anonymous guest" : "Signed in"}
                </Chip>
              </View>
            </View>
          </View>
        </View>

        {/* Pact counts */}
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
          PACTS
        </Text>
        <View
          style={{
            paddingHorizontal: 20,
            flexDirection: "row",
            gap: 8,
          }}
        >
          <StatTile
            value={String(stats?.activeCount ?? 0)}
            label="Active"
            color={C.ink}
          />
          <StatTile
            value={String(stats?.completedCount ?? 0)}
            label="Kept ✓"
            color={C.primary}
          />
          <StatTile
            value={String(stats?.forfeitedCount ?? 0)}
            label="Broken ✗"
            color={C.danger}
          />
        </View>

        {/* Money */}
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
          MONEY
        </Text>
        <View
          style={{
            marginHorizontal: 20,
            backgroundColor: "#fff",
            borderRadius: 22,
            paddingVertical: 4,
          }}
        >
          <MoneyRow
            label="On the line"
            value={dollars(stats?.totalAtStakeCents ?? 0)}
            tone={C.ink}
          />
          <Divider />
          <MoneyRow
            label="Saved"
            value={dollars(stats?.totalSavedCents ?? 0)}
            tone={C.primary}
          />
          <Divider />
          <MoneyRow
            label="Donated"
            value={dollars(stats?.totalDonatedCents ?? 0)}
            tone={C.danger}
          />
        </View>

        {/* Sign out */}
        <View style={{ paddingHorizontal: 20, paddingTop: 28 }}>
          <Btn
            kind="danger"
            onPress={() => {
              void authClient.signOut();
            }}
          >
            Sign out
          </Btn>
        </View>
      </ScrollView>

      <TabBar
        active="me"
        onSelect={(t) => {
          if (t === "me") return;
          if (t === "home") router.replace("/");
          if (t === "create") router.push("/create");
        }}
      />
    </View>
  );
}

function StatTile({
  value,
  label,
  color,
}: {
  value: string;
  label: string;
  color: string;
}) {
  return (
    <View
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
          fontSize: 22,
          fontWeight: "800",
          color,
          letterSpacing: -0.4,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontSize: 11,
          color: C.ink2,
          marginTop: 4,
          fontWeight: "600",
        }}
      >
        {label}
      </Text>
    </View>
  );
}

function MoneyRow({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone: string;
}) {
  return (
    <View
      style={{
        paddingHorizontal: 18,
        paddingVertical: 14,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <Text style={{ fontSize: 14, color: C.ink2, fontWeight: "500" }}>
        {label}
      </Text>
      <Text style={{ fontSize: 18, fontWeight: "800", color: tone }}>
        {value}
      </Text>
    </View>
  );
}

function Divider() {
  return (
    <View
      style={{
        height: 1,
        backgroundColor: C.line,
        marginHorizontal: 18,
      }}
    />
  );
}
