import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import * as ImagePicker from "expo-image-picker";
import { useState } from "react";
import { Image, KeyboardAvoidingView, StyleSheet, Text, View } from "react-native";
import { getApiErrorMessage } from "../../api/client";
import { getMe, updateMe, uploadAvatar } from "../../api/services";
import { useAuth } from "../../context/auth-context";
import { Alert, Button, Card, Field, Skeleton } from "../ui";
import { colors, radius, spacing } from "../../theme";

const AVATAR_MAX_SIZE_BYTES = 5 * 1024 * 1024;
const AVATAR_MIME_TYPES = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);

type AvatarAsset = { uri: string; fileName?: string | null; fileSize?: number; mimeType?: string | null; file?: Blob };

function mimeFromName(fileName?: string | null) {
  const extension = fileName?.split(".").pop()?.toLowerCase();
  if (extension === "jpg" || extension === "jpeg") return "image/jpeg";
  if (extension === "png") return "image/png";
  if (extension === "webp") return "image/webp";
  if (extension === "gif") return "image/gif";
  return null;
}

export function ProfileForm() {
  const { setUser } = useAuth();
  const queryClient = useQueryClient();
  const profileQuery = useQuery({ queryKey: ["me"], queryFn: getMe });
  const [draftName, setDraftName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [selectedAvatar, setSelectedAvatar] = useState<AvatarAsset | null>(null);
  const saveProfile = useMutation({
    mutationFn: (nextName: string) => updateMe({ name: nextName }),
    onSuccess: async (profile) => {
      setUser(profile);
      setDraftName(profile.name);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["me"] }), queryClient.invalidateQueries({ queryKey: ["dashboard"] })]);
      setNotice("Thông tin cá nhân đã được cập nhật.");
    },
    onError: (caught) => setError(getApiErrorMessage(caught)),
  });
  const upload = useMutation({
    mutationFn: (asset: AvatarAsset) => uploadAvatar(asset.file ?? asset.uri, asset.fileName ?? "avatar.jpg"),
    onSuccess: async (profile) => {
      setUser(profile);
      await Promise.all([queryClient.invalidateQueries({ queryKey: ["me"] }), queryClient.invalidateQueries({ queryKey: ["dashboard"] })]);
      setSelectedAvatar(null);
      setError(null);
      setNotice("Ảnh đại diện đã được cập nhật.");
    },
    onError: (caught) => setError(getApiErrorMessage(caught)),
  });

  const name = draftName ?? profileQuery.data?.name ?? "";

  async function pickAvatar() {
    setError(null);
    setNotice(null);
    const result = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ["images"], allowsEditing: true, aspect: [1, 1], quality: 1 });
    if (result.canceled || !result.assets[0]) return;
    const asset = result.assets[0];
    const mimeType = asset.mimeType ?? mimeFromName(asset.fileName);
    if (!mimeType || !AVATAR_MIME_TYPES.has(mimeType)) {
      setError("Ảnh đại diện phải là JPEG, PNG, WebP hoặc GIF.");
      return;
    }
    if (asset.fileSize && asset.fileSize > AVATAR_MAX_SIZE_BYTES) {
      setError("Ảnh đại diện phải có dung lượng tối đa 5MB.");
      return;
    }
    setSelectedAvatar({ uri: asset.uri, fileName: asset.fileName, fileSize: asset.fileSize, mimeType, file: asset.file ?? undefined });
  }

  function saveProfileInfo() {
    setError(null);
    setNotice(null);
    const trimmed = name.trim();
    if (trimmed.length < 2 || trimmed.length > 100) {
      setError("Họ và tên phải có từ 2 đến 100 ký tự.");
      return;
    }
    saveProfile.mutate(trimmed);
  }

  const profile = profileQuery.data;
  const avatarUri = selectedAvatar?.uri ?? profile?.avatar ?? null;
  const initials = (profile?.name ?? "?").split(" ").filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");

  return (
    <KeyboardAvoidingView behavior="padding" style={styles.container}>
      <Card style={styles.card}>
        <Text style={styles.title}>Ảnh đại diện</Text>
        <Text style={styles.subtitle}>Chọn ảnh JPEG, PNG, WebP hoặc GIF, tối đa 5MB.</Text>
        {profileQuery.isLoading ? <Skeleton height={92} /> : (
          <View style={styles.avatarRow}>
            {avatarUri ? <Image source={{ uri: avatarUri }} style={styles.avatar} /> : <View style={[styles.avatar, styles.avatarPlaceholder]}><Text style={styles.avatarText}>{initials || "?"}</Text></View>}
            <View style={styles.avatarActions}>
              <Button title="Chọn ảnh" variant="secondary" loading={upload.isPending} onPress={() => void pickAvatar()} />
              {selectedAvatar ? <Button title="Lưu ảnh đại diện" loading={upload.isPending} onPress={() => upload.mutate(selectedAvatar)} /> : null}
              {selectedAvatar ? <Button title="Bỏ ảnh đã chọn" variant="ghost" disabled={upload.isPending} onPress={() => setSelectedAvatar(null)} /> : null}
            </View>
          </View>
        )}
      </Card>
      <Card style={styles.card}>
        <Text style={styles.title}>Thông tin cá nhân</Text>
        <Text style={styles.subtitle}>Cập nhật thông tin hồ sơ của bạn.</Text>
        {profileQuery.isLoading ? <Skeleton height={180} /> : (
          <>
            {error ? <Alert tone="danger" title="Không thể lưu" message={error} /> : null}
            {notice ? <Alert tone="success" title="Thành công" message={notice} /> : null}
            <Field label="Họ và tên" value={name} onChangeText={setDraftName} />
            <View style={styles.readonlyField}>
              <Text style={styles.label}>Email</Text>
              <View style={styles.readonlyInput}><Text style={styles.readonlyText}>{profile?.email ?? ""}</Text></View>
              <Text style={styles.hint}>Email không thể thay đổi.</Text>
            </View>
            <Button title={saveProfile.isPending ? "Đang lưu..." : "Lưu thay đổi"} loading={saveProfile.isPending} onPress={saveProfileInfo} />
          </>
        )}
      </Card>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md },
  card: { gap: spacing.md },
  title: { color: colors.ink, fontSize: 20, fontWeight: "800" },
  subtitle: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19 },
  avatarRow: { flexDirection: "row", alignItems: "center", gap: spacing.md },
  avatar: { width: 88, height: 88, borderRadius: radius.pill, backgroundColor: colors.softBlue },
  avatarPlaceholder: { alignItems: "center", justifyContent: "center" },
  avatarText: { color: colors.primary, fontSize: 24, fontWeight: "800" },
  avatarActions: { flex: 1, gap: spacing.sm },
  readonlyField: { gap: spacing.xs },
  label: { color: colors.ink, fontSize: 14, fontWeight: "600" },
  readonlyInput: { minHeight: 52, justifyContent: "center", paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  readonlyText: { color: colors.muted, fontSize: 15 },
  hint: { color: colors.mutedForeground, fontSize: 12 },
});
