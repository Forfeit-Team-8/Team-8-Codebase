import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";
import Svg, { Path } from "react-native-svg";

import { C } from "./theme";

interface TopBarProps {
  title: string;
  subtitle?: string;
  leading?: ReactNode;
  trailing?: ReactNode;
}

export function TopBar({ title, subtitle, leading, trailing }: TopBarProps) {
  return (
    <View
      style={{
        paddingTop: 64,
        paddingBottom: 12,
        paddingHorizontal: 20,
        flexDirection: "row",
        alignItems: "center",
        gap: 12,
      }}
    >
      <View style={{ width: 36 }}>{leading}</View>
      <View style={{ flex: 1, alignItems: "center" }}>
        <Text
          style={{
            fontWeight: "700",
            fontSize: 17,
            color: C.ink,
            letterSpacing: -0.2,
          }}
        >
          {title}
        </Text>
        {subtitle ? (
          <Text style={{ fontSize: 11, color: C.muted }}>{subtitle}</Text>
        ) : null}
      </View>
      <View style={{ width: 36, alignItems: "flex-end" }}>{trailing}</View>
    </View>
  );
}

interface BackButtonProps {
  onPress?: () => void;
}
export function BackButton({ onPress }: BackButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      style={{
        width: 36,
        height: 36,
        borderRadius: 18,
        backgroundColor: "#fff",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: C.line,
        shadowOpacity: 1,
        shadowOffset: { width: 0, height: 1 },
        shadowRadius: 0,
      }}
    >
      <Svg width={9} height={14} viewBox="0 0 9 14">
        <Path
          d="M7.5 1L1.5 7l6 6"
          stroke={C.ink}
          strokeWidth={2}
          fill="none"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </Svg>
    </Pressable>
  );
}
