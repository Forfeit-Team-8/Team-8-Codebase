import { Pressable, Text, View } from "react-native";

import { C } from "./theme";

export type TabId = "home" | "create" | "me";

interface TabBarProps {
  active: TabId;
  onSelect: (id: TabId) => void;
}

export function TabBar({ active, onSelect }: TabBarProps) {
  const tabs: { id: TabId; label: string; icon: string }[] = [
    { id: "home", label: "Pacts", icon: "◉" },
    { id: "create", label: "New", icon: "＋" },
    { id: "me", label: "Me", icon: "◐" },
  ];

  return (
    <View
      style={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 30,
        paddingBottom: 28,
        paddingTop: 8,
        backgroundColor: C.bg,
        flexDirection: "row",
        justifyContent: "space-around",
      }}
    >
      {tabs.map((t) => {
        const isActive = active === t.id;
        return (
          <Pressable
            key={t.id}
            onPress={() => onSelect(t.id)}
            style={{
              alignItems: "center",
              gap: 2,
              paddingHorizontal: 16,
              paddingVertical: 4,
            }}
          >
            <View
              style={{
                width: 36,
                height: 36,
                borderRadius: 12,
                alignItems: "center",
                justifyContent: "center",
                backgroundColor: isActive ? C.ink : "transparent",
              }}
            >
              <Text
                style={{
                  color: isActive ? "#fff" : C.ink2,
                  fontSize: 18,
                  fontWeight: "700",
                }}
              >
                {t.icon}
              </Text>
            </View>
            <Text
              style={{
                fontSize: 11,
                fontWeight: "600",
                color: isActive ? C.ink : C.muted,
              }}
            >
              {t.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}
