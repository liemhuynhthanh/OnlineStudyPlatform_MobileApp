import { useMutation } from "@tanstack/react-query";
import { useState } from "react";
import { KeyboardAvoidingView, StyleSheet, Text } from "react-native";
import { getApiErrorMessage } from "../../api/client";
import { changePassword } from "../../api/services";
import { Alert, Button, Card, Field } from "../ui";
import { colors, spacing } from "../../theme";

export function PasswordForm() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const mutation = useMutation({ mutationFn: changePassword });

  function submit() {
    setError(null);
    setNotice(null);
    if (!currentPassword) {
      setError("Vui lòng nhập mật khẩu hiện tại.");
      return;
    }
    if (newPassword.length < 8 || !/[A-Za-z]/.test(newPassword) || !/\d/.test(newPassword) || !/[^A-Za-z0-9]/.test(newPassword)) {
      setError("Mật khẩu phải có ít nhất 8 ký tự, gồm chữ cái, chữ số và ký tự đặc biệt.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }
    mutation.mutate({ currentPassword, newPassword }, {
      onSuccess: () => {
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setNotice("Mật khẩu đã được thay đổi.");
      },
      onError: (caught) => setError(getApiErrorMessage(caught)),
    });
  }

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Đổi mật khẩu</Text>
        <Text style={styles.subtitle}>Sử dụng mật khẩu hiện tại để đặt mật khẩu mới.</Text>
        {error ? <Alert tone="danger" title="Không thể đổi mật khẩu" message={error} /> : null}
        {notice ? <Alert tone="success" title="Thành công" message={notice} /> : null}
        <Field label="Mật khẩu hiện tại" value={currentPassword} onChangeText={setCurrentPassword} placeholder="Nhập mật khẩu hiện tại..." secureTextEntry />
        <Field label="Mật khẩu mới" value={newPassword} onChangeText={setNewPassword} placeholder="Nhập mật khẩu mới..." secureTextEntry />
        <Field label="Xác nhận mật khẩu mới" value={confirmPassword} onChangeText={setConfirmPassword} placeholder="Xác nhận mật khẩu mới..." secureTextEntry />
        <Button title={mutation.isPending ? "Đang đổi mật khẩu..." : "Đổi mật khẩu"} loading={mutation.isPending} onPress={submit} />
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({ container: { gap: spacing.md }, card: { gap: spacing.md }, title: { color: colors.ink, fontSize: 20, fontWeight: "800" }, subtitle: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19 } });
