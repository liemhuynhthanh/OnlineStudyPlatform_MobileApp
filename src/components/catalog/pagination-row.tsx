import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius, spacing } from "../../theme";

export function PaginationRow({ page, totalPages, total, onChange }: { page: number; totalPages: number; total: number; onChange: (page: number) => void }) {
  const canGoBack = page > 1;
  const canGoForward = page < totalPages;
  return (
    <View style={styles.container}>
      <Text style={styles.summary}>{`${total.toLocaleString("vi-VN")} kết quả · Trang ${page}/${totalPages}`}</Text>
      <View style={styles.actions}>
        <Pressable accessibilityRole="button" accessibilityLabel="Trang trước" disabled={!canGoBack} onPress={() => onChange(page - 1)} style={({ pressed }) => [styles.button, !canGoBack && styles.buttonDisabled, pressed && styles.buttonPressed]}><Text style={[styles.buttonText, !canGoBack && styles.buttonTextDisabled]}>Trước</Text></Pressable>
        <Pressable accessibilityRole="button" accessibilityLabel="Trang sau" disabled={!canGoForward} onPress={() => onChange(page + 1)} style={({ pressed }) => [styles.button, !canGoForward && styles.buttonDisabled, pressed && styles.buttonPressed]}><Text style={[styles.buttonText, !canGoForward && styles.buttonTextDisabled]}>Sau</Text></Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, paddingVertical: spacing.sm },
  summary: { flex: 1, color: colors.mutedForeground, fontSize: 13 },
  actions: { flexDirection: "row", gap: spacing.sm },
  button: { minHeight: 40, paddingHorizontal: spacing.md, alignItems: "center", justifyContent: "center", borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  buttonDisabled: { opacity: 0.5 },
  buttonPressed: { opacity: 0.8 },
  buttonText: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  buttonTextDisabled: { color: colors.muted },
});
