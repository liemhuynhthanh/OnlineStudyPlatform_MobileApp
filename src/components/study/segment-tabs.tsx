import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { colors, radius } from "../../theme";

export interface SegmentTabOption<T extends string> {
  value: T;
  label: string;
  icon?: keyof typeof Ionicons.glyphMap;
}

export function SegmentTabs<T extends string>({ value, options, onChange }: { value: T; options: SegmentTabOption<T>[]; onChange: (value: T) => void }) {
  return (
    <View style={styles.container}>
      {options.map((option) => {
        const active = option.value === value;
        return (
          <Pressable key={option.value} accessibilityRole="tab" accessibilityState={{ selected: active }} onPress={() => onChange(option.value)} style={({ pressed }) => [styles.tab, active && styles.tabActive, pressed && styles.tabPressed]}>
            {option.icon ? <Ionicons name={option.icon} size={16} color={active ? colors.primary : colors.muted} /> : null}
            <Text style={[styles.label, active && styles.labelActive]}>{option.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flexDirection: "row", gap: 4, padding: 4, borderRadius: radius.md, backgroundColor: colors.softBlue },
  tab: { flex: 1, minHeight: 40, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12 },
  tabActive: { backgroundColor: colors.surface, shadowColor: "#17164112", shadowOpacity: 1, shadowRadius: 6, shadowOffset: { width: 0, height: 2 } },
  tabPressed: { opacity: 0.7 },
  label: { color: colors.muted, fontSize: 13, fontWeight: "700" },
  labelActive: { color: colors.primary },
});
