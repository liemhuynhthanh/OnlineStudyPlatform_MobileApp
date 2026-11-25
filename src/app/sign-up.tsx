import { router } from "expo-router";
import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text } from "react-native";
import { getApiErrorMessage } from "../api/client";
import { registerUser } from "../api/services";
import { Alert, Button, Card, Field, Header, Screen } from "../components/ui";
import { colors, spacing } from "../theme";

export default function SignUp() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function submit() {
    setError(null);
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();
    if (trimmedName.length < 2) {
      setError("Họ và tên phải có ít nhất 2 ký tự.");
      return;
    }
    if (!/^\S+@\S+\.\S+$/.test(trimmedEmail)) {
      setError("Vui lòng nhập email hợp lệ.");
      return;
    }
    if (password.length < 8 || !/[A-Za-z]/.test(password) || !/\d/.test(password) || !/[^A-Za-z0-9]/.test(password)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ cái, chữ số và ký tự đặc biệt.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    setLoading(true);
    try {
      const result = await registerUser({ name: trimmedName, email: trimmedEmail, password });
      router.push({ pathname: "/verify-email", params: { email: result.email, delivery: result.emailDelivery } });
    } catch (caught) {
      setError(getApiErrorMessage(caught));
    } finally {
      setLoading(false);
    }
  }

  return (
    <Screen>
      <Header title="Đăng ký" canGoBack fallbackHref="/sign-in" />
      <KeyboardAvoidingView behavior="padding" style={styles.container}>
        <Card style={styles.card}>
          <Text style={styles.title}>Tạo tài khoản</Text>
          <Text style={styles.subtitle}>Tạo tài khoản học viên để tham gia các khóa học.</Text>
          {error ? <Alert tone="danger" title="Không thể đăng ký" message={error} /> : null}
          <Field label="Họ và tên" value={name} onChangeText={setName} placeholder="Nhập họ và tên của bạn..." />
          <Field label="Email" value={email} onChangeText={setEmail} placeholder="Nhập email của bạn..." keyboardType="email-address" />
          <Field label="Mật khẩu" value={password} onChangeText={setPassword} placeholder="Nhập mật khẩu..." secureTextEntry />
          <Field label="Xác nhận mật khẩu" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Nhập lại mật khẩu..." secureTextEntry />
          <Button title={loading ? "Đang đăng ký..." : "Đăng ký"} loading={loading} onPress={() => void submit()} />
          <Button title="Quay lại đăng nhập" variant="ghost" onPress={() => router.replace("/sign-in")} />
        </Card>
      </KeyboardAvoidingView>
    </Screen>
  );
}

const styles = StyleSheet.create({ container: { flex: 1 }, card: { gap: spacing.md }, title: { color: colors.ink, fontSize: 26, fontWeight: "800" }, subtitle: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21 }, note: { color: colors.muted, fontSize: 12 } });
