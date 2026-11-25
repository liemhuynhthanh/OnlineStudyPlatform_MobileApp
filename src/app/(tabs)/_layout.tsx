import { Tabs } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useAuth } from "../../context/auth-context";
import { colors } from "../../theme";

export default function TabLayout() {
  const { user } = useAuth();
  return <Tabs screenOptions={{ headerShown: false, tabBarHideOnKeyboard: true, tabBarActiveTintColor: colors.primary, tabBarInactiveTintColor: colors.muted, tabBarLabelStyle: { fontSize: 11, fontWeight: "700" }, tabBarStyle: { height: 68, paddingTop: 7, paddingBottom: 9, borderTopColor: colors.border, backgroundColor: colors.surface }, tabBarItemStyle: { borderRadius: 14, marginHorizontal: 3, marginVertical: 4 } }}><Tabs.Screen name="index" options={{ title: user ? "Tổng quan" : "Trang chủ", tabBarIcon: ({ color, size }) => <Ionicons name="home-outline" size={size} color={String(color)} /> }} /><Tabs.Screen name="courses" options={{ title: "Khám phá", tabBarIcon: ({ color, size }) => <Ionicons name="compass-outline" size={size} color={String(color)} /> }} /><Tabs.Screen name="my-learning" options={{ title: "Khóa học", tabBarIcon: ({ color, size }) => <Ionicons name="book-outline" size={size} color={String(color)} /> }} /><Tabs.Screen name="profile" options={{ title: "Hồ sơ", tabBarIcon: ({ color, size }) => <Ionicons name="person-outline" size={size} color={String(color)} /> }} /></Tabs>;
}
