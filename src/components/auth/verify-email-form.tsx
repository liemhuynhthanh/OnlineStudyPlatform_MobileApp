import { router } from "expo-router";
import { useEffect, useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text, TextInput, View } from "react-native";
import { getApiErrorMessage } from "../../api/client";
import { resendEmailOtp, verifyEmail } from "../../api/services";
import { Alert, Button, Card, Header, Screen } from "../ui";
import { colors, radius, spacing } from "../../theme";

const UNAVAILABLE_MESSAGE = "Chưa gửi được email OTP do cấu hình SMTP hoặc nhà cung cấp mail. Vui lòng kiểm tra cấu hình và thử gửi lại.";

export function VerifyEmailForm({ email, delivery }: { email: string; delivery: string }) {
  const [otp, setOtp] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(delivery === "unavailable" ? UNAVAILABLE_MESSAGE : null);
  const [cooldown, setCooldown] = useState(60);
  const [verifying, setVerifying] = useState(false);
  const [resending, setResending] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((value) => Math.max(0, value - 1)), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

  async function onVerify() {
    setFormError(null);
    setSuccessMessage(null);
    if (!email) {
      setFormError("Thiếu email cần xác thực. Vui lòng đăng ký lại.");
      return;
    }
    if (!/^\d{6}$/.test(otp)) {
      setFormError("Vui lòng nhập mã OTP gồm 6 chữ số.");
      return;
    }
    setVerifying(true);
    try {
      await verifyEmail(email, otp);
      setSuccessMessage("Xác thực email thành công. Đang chuyển đến đăng nhập...");
      setTimeout(() => router.replace("/sign-in"), 800);
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setVerifying(false);
    }
  }

  async function onResend() {
    setFormError(null);
    setSuccessMessage(null);
    if (!email) {
      setFormError("Thiếu email cần xác thực. Vui lòng đăng ký lại.");
      return;
    }
    setResending(true);
    try {
      const result = await resendEmailOtp(email);
      setCooldown(result.resendCooldownSeconds);
      setSuccessMessage(result.emailDelivery === "sent" ? "Mã OTP mới đã được gửi đến email của bạn." : "Yêu cầu gửi lại đã được ghi nhận. Vui lòng thử lại nếu chưa nhận được mã.");
    } catch (error) {
      setFormError(getApiErrorMessage(error));
    } finally {
      setResending(false);
    }
  }

  return (
    <Screen>
      <Header title="Xác thực email" canGoBack fallbackHref="/sign-in" />
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Xác thực email</Text>
          <Text style={styles.subtitle}>Nhập mã OTP gồm 6 chữ số đã gửi đến {email || "email của bạn"}.</Text>
          {formError ? <Alert tone="danger" title="Không thể xác thực" message={formError} /> : null}
          {successMessage ? <Alert tone="success" title="Thông báo" message={successMessage} /> : null}
          <View style={styles.field}>
            <Text style={styles.label}>Mã OTP</Text>
            <TextInput accessibilityLabel="Mã OTP" value={otp} onChangeText={(value) => setOtp(value.replace(/\D/g, "").slice(0, 6))} placeholder="Nhập 6 chữ số" placeholderTextColor={colors.muted} keyboardType="numeric" autoCapitalize="none" maxLength={6} style={styles.input} />
          </View>
          <Button title={verifying ? "Đang xác thực..." : "Xác thực"} loading={verifying} disabled={resending} onPress={() => void onVerify()} />
          <Button title={cooldown > 0 ? `Gửi lại sau ${cooldown}s` : "Gửi lại mã OTP"} variant="secondary" loading={resending} disabled={cooldown > 0 || verifying} onPress={() => void onResend()} />
          <Button title="Quay lại đăng nhập" variant="ghost" onPress={() => router.replace("/sign-in")} />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  card: { gap: spacing.md },
  title: { color: colors.ink, fontSize: 24, fontWeight: "800" },
  subtitle: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21 },
  field: { gap: spacing.xs },
  label: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  input: { minHeight: 52, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 18, letterSpacing: 4, textAlign: "center" },
});
