import { Stack, useRouter, useSegments } from "expo-router";
import { useEffect } from "react";
import { ActivityIndicator, StyleSheet, View } from "react-native";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { StatusBar } from "expo-status-bar";
import { AuthProvider, useAuth } from "../context/auth-context";
import { PushNotifications } from "../components/push/push-notifications";
import { colors } from "../theme";

const queryClient = new QueryClient({ defaultOptions: { queries: { staleTime: 30_000, retry: 1 } } });
const authRoutes = new Set(["sign-in", "sign-up", "forgot-password", "verify-email"]);
const learnerRoutes = new Set(["learn", "cart", "checkout", "payment", "payments", "certificates", "notifications"]);
const learnerTabs = new Set(["my-learning", "profile"]);

function AuthGate() {
  const { user, hydrated } = useAuth();
  const segments = useSegments();
  const router = useRouter();
  useEffect(() => {
    if (!hydrated) return;
    const first = segments[0] ?? "";
    const second = (segments as string[])[1] ?? "";
    const inAuth = authRoutes.has(first);
    const inLearnerTab = first === "(tabs)" && learnerTabs.has(second);
    const inLearnerRoute = learnerRoutes.has(first) || inLearnerTab;
    if (!user && inLearnerRoute) {
      router.replace("/sign-in");
      return;
    }
    if (user && inAuth) router.replace("/(tabs)");
  }, [hydrated, router, segments, user]);
  if (!hydrated) return <View style={styles.loading}><ActivityIndicator size="large" color={colors.primary} /></View>;
  return <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.background } }} />;
}

export default function RootLayout() { return <QueryClientProvider client={queryClient}><AuthProvider><StatusBar style="auto" /><PushNotifications /><AuthGate /></AuthProvider></QueryClientProvider>; }

const styles = StyleSheet.create({ loading: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background } });
