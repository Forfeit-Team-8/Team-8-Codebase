import { useColorScheme } from "react-native";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { QueryClientProvider } from "@tanstack/react-query";
import { HeroUINativeProvider } from "heroui-native";

import { queryClient } from "~/utils/api";
import { useEnsureSignedIn } from "~/utils/use-ensure-signed-in";

import "../styles.css";

// This is the main layout of the app
// It wraps your pages with the providers they need
export default function RootLayout() {
  const colorScheme = useColorScheme();
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <HeroUINativeProvider>
          <QueryClientProvider client={queryClient}>
            <SignInGate />
            <Stack
              screenOptions={{
                headerStyle: {
                  backgroundColor: "#c03484",
                },
                contentStyle: {
                  backgroundColor:
                    colorScheme === "dark" ? "#09090B" : "#FFFFFF",
                },
              }}
            />
            <StatusBar />
          </QueryClientProvider>
        </HeroUINativeProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// Renders nothing — only here to mount the `useEnsureSignedIn` effect inside
// the QueryClientProvider so the anonymous sign-in fires regardless of
// which screen the user lands on first.
function SignInGate() {
  useEnsureSignedIn();
  return null;
}
