import { Ionicons } from "@expo/vector-icons";
import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { Button } from "../ui";
import { colors, radius, spacing } from "../../theme";

export const COURSE_CATEGORY_OPTIONS = [
  { value: "", label: "Tất cả danh mục" },
  { value: "Programming", label: "Lập trình" },
  { value: "Data", label: "Dữ liệu" },
  { value: "Design", label: "Thiết kế" },
  { value: "Business", label: "Kinh doanh" },
  { value: "Language", label: "Ngoại ngữ" },
  { value: "Other", label: "Khác" },
] as const;

export function formatCourseCategory(value: string) {
  return COURSE_CATEGORY_OPTIONS.find((option) => option.value === value)?.label ?? value;
}

export function CatalogFilters({ query, category, onQueryChange, onCategoryChange, onClear }: { query: string; category: string; onQueryChange: (value: string) => void; onCategoryChange: (value: string) => void; onClear: () => void }) {
  const hasFilters = Boolean(query || category);
  return (
    <View style={styles.container}>
      <View style={styles.searchRow}>
        <View style={styles.search}>
          <Ionicons name="search-outline" size={18} color={colors.muted} />
          <TextInput accessibilityLabel="Tìm kiếm khóa học" value={query} onChangeText={onQueryChange} placeholder="Bạn muốn học điều gì?" placeholderTextColor={colors.muted} autoCapitalize="none" style={styles.input} />
        </View>
        <Button title="Xóa lọc" variant="danger" disabled={!hasFilters} onPress={onClear} />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chips}>
        {COURSE_CATEGORY_OPTIONS.map((option) => (
          <Pressable key={option.value || "all"} accessibilityRole="button" accessibilityState={{ selected: category === option.value }} onPress={() => onCategoryChange(option.value)} style={({ pressed }) => [styles.chip, category === option.value && styles.chipActive, pressed && styles.chipPressed]}>
            <Text style={[styles.chipText, category === option.value && styles.chipTextActive]}>{option.label}</Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.md, padding: spacing.md, borderRadius: radius.lg, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border },
  searchRow: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  search: { flex: 1, flexDirection: "row", alignItems: "center", gap: spacing.sm, minHeight: 48, paddingHorizontal: spacing.md, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.background },
  input: { flex: 1, color: colors.ink, fontSize: 15 },
  chips: { gap: spacing.sm, paddingRight: spacing.md },
  chip: { paddingHorizontal: 14, paddingVertical: 9, borderRadius: radius.pill, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface },
  chipActive: { borderColor: colors.navy, backgroundColor: colors.navy },
  chipPressed: { opacity: 0.8 },
  chipText: { color: colors.mutedForeground, fontSize: 13, fontWeight: "700" },
  chipTextActive: { color: colors.white },
});
