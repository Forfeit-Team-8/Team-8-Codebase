import type { ReactNode } from "react";
import { Text, View } from "react-native";

import { C } from "./theme";

const TONES = {
  green: { bg: C.chip, fg: "#1a7d49" },
  warm: { bg: C.chipWarm, fg: "#A4691B" },
  danger: { bg: C.chipDanger, fg: "#9a3340" },
  ink: { bg: "#EAF1ED", fg: C.ink },
} as const;

export type ChipTone = keyof typeof TONES;

interface ChipProps {
  children: ReactNode;
  tone?: ChipTone;
}

export function Chip({ children, tone = "green" }: ChipProps) {
  const t = TONES[tone];
  return (
    <View
      style={{
        alignSelf: "flex-start",
        backgroundColor: t.bg,
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 999,
      }}
    >
      <Text
        style={{
          fontSize: 12,
          fontWeight: "600",
          letterSpacing: 0.1,
          color: t.fg,
        }}
      >
        {children}
      </Text>
    </View>
  );
}
