import { router } from "expo-router";
import { useState } from "react";
import { Alert, StyleSheet, Text, View } from "react-native";
import { Button, Field, Screen } from "../components/ui";
import { getApiErrorMessage } from "../api/client";
import { requestPasswordReset, resetPassword, verifyPasswordReset } from "../api/services";
import { colors, spacing } from "../theme";

export default function ForgotPassword() { const [step, setStep] = useState(1); const [email, setEmail] = useState(""); const [otp, setOtp] = useState(""); const [token, setToken] = useState(""); const [password, setPassword] = useState(""); const [loading, setLoading] = useState(false);
  async function next() { setLoading(true); try { if (step === 1) { await requestPasswordReset(email); setStep(2); } else if (step === 2) { const result = await verifyPasswordReset(email, otp); setToken(result.resetToken); setStep(3); } else { await resetPassword(token, password); Alert.alert("Đã đổi mật khẩu", "Bạn có thể đăng nhập bằng mật khẩu mới.", [{ text: "Đăng nhập", onPress: () => router.replace("/sign-in") }]); } } catch (error) { Alert.alert("Không thể tiếp tục", getApiErrorMessage(error)); } finally { setLoading(false); } }
  return <Screen><View style={styles.container}><Text style={styles.title}>Đặt lại mật khẩu</Text><Text style={styles.subtitle}>Bước {step}/3</Text>{step === 1 && <Field label="Email" value={email} onChangeText={setEmail} keyboardType="email-address" />}{step === 2 && <Field label="Mã OTP" value={otp} onChangeText={setOtp} keyboardType="numeric" />}{step === 3 && <Field label="Mật khẩu mới" value={password} onChangeText={setPassword} secureTextEntry />}</View><Button title="Tiếp tục" onPress={next} loading={loading} /></Screen>; }
const styles = StyleSheet.create({ container: { flex: 1, justifyContent: "center", gap: spacing.md }, title: { fontSize: 28, color: colors.ink, fontWeight: "800" }, subtitle: { color: colors.muted } });
