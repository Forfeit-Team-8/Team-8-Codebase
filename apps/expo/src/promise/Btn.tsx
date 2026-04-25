import type { ReactNode } from "react";
import type { PressableProps, ViewStyle } from "react-native";
import { Pressable, Text, View } from "react-native";

import { C } from "./theme";

type BtnKind = "primary" | "accent" | "green" | "soft" | "ghost" | "danger";
type BtnSize = "sm" | "md" | "lg";

interface BtnProps extends Omit<PressableProps, "style"> {
  children: ReactNode;
  kind?: BtnKind;
  size?: BtnSize;
  icon?: ReactNode;
  style?: ViewStyle;
}

const SIZES: Record<BtnSize, ViewStyle & { fontSize: number }> = {
  lg: {
    fontSize: 17,
    paddingHorizontal: 20,
    paddingVertical: 16,
    minHeight: 54,
  },
  md: {
    fontSize: 15,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 44,
  },
  sm: {
    fontSize: 13,
    paddingHorizontal: 12,
    paddingVertical: 8,
    minHeight: 32,
  },
};

const KINDS: Record<BtnKind, { bg: string; fg: string; shadow?: string }> = {
  primary: { bg: C.ink, fg: "#fff", shadow: "#0a1a12" },
  accent: { bg: C.accent, fg: C.ink, shadow: "#c99a3d" },
  green: { bg: C.primary, fg: "#fff", shadow: "#1a7d49" },
  soft: { bg: C.chip, fg: C.ink },
  ghost: { bg: "transparent", fg: C.ink },
  danger: { bg: C.danger, fg: "#fff", shadow: "#9a3340" },
};

export function Btn({
  children,
  kind = "primary",
  size = "lg",
  icon,
  style,
  ...rest
}: BtnProps) {
  const sizeStyle = SIZES[size];
  const k = KINDS[kind];
  return (
    <Pressable
      {...rest}
      style={({ pressed }) => ({
        backgroundColor: k.bg,
        borderRadius: size === "sm" ? 10 : 16,
        paddingHorizontal: sizeStyle.paddingHorizontal,
        paddingVertical: sizeStyle.paddingVertical,
        minHeight: sizeStyle.minHeight,
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "row",
        gap: 8,
        transform: [{ translateY: pressed ? 1 : 0 }],
        ...(k.shadow
          ? {
              shadowColor: k.shadow,
              shadowOpacity: 1,
              shadowRadius: 0,
              shadowOffset: { width: 0, height: 2 },
              elevation: 2,
            }
          : null),
        ...style,
      })}
    >
      {icon ? <View>{icon}</View> : null}
      <Text
        style={{
          color: k.fg,
          fontSize: sizeStyle.fontSize,
          fontWeight: "600",
          letterSpacing: -0.2,
        }}
      >
        {children}
      </Text>
    </Pressable>
  );
}
