import { Link, router } from "expo-router";
import { useState } from "react";
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, View } from "react-native";
import { Button, Field, Screen } from "../components/ui";
import { getApiErrorMessage } from "../api/client";
import { useAuth } from "../context/auth-context";
import { colors, spacing } from "../theme";

export default function SignIn() {
  const { signIn } = useAuth(); const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  async function submit() { if (!email || !password) return Alert.alert("Thiếu thông tin", "Vui lòng nhập email và mật khẩu."); setLoading(true); try { await signIn(email, password); router.replace("/(tabs)"); } catch (error) { Alert.alert("Đăng nhập thất bại", getApiErrorMessage(error)); } finally { setLoading(false); } }
  return <Screen><KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : undefined} style={styles.wrapper}><View style={styles.brand}><Text style={styles.logo}>E</Text><Text style={styles.title}>Chào mừng trở lại</Text><Text style={styles.subtitle}>Tiếp tục hành trình học tập của bạn.</Text></View><View style={styles.form}><Field label="Email" value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" /><Field label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="••••••••" secureTextEntry /><Link href="/forgot-password" style={styles.link}>Quên mật khẩu?</Link><Button title="Đăng nhập" onPress={submit} loading={loading} /><View style={styles.signup}><Text style={styles.muted}>Chưa có tài khoản? </Text><Link href="/sign-up" style={styles.link}>Đăng ký</Link></View></View></KeyboardAvoidingView></Screen>;
}
const styles = StyleSheet.create({ wrapper: { flex: 1, justifyContent: "center", gap: spacing.xl }, brand: { alignItems: "center", gap: spacing.sm }, logo: { width: 64, height: 64, borderRadius: 20, backgroundColor: colors.primary, color: "#fff", textAlign: "center", textAlignVertical: "center", fontSize: 38, fontWeight: "800" }, title: { color: colors.ink, fontSize: 26, fontWeight: "800", textAlign: "center" }, subtitle: { color: colors.muted, fontSize: 15, textAlign: "center" }, form: { gap: spacing.md }, link: { color: colors.primary, fontWeight: "700" }, signup: { flexDirection: "row", justifyContent: "center" }, muted: { color: colors.muted } });
