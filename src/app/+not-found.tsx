import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";
import { Button, Screen } from "../components/ui";
import { getWebUrl, openWeb } from "../utils/open-web";
import { colors, radius, spacing } from "../theme";

export default function NotFound() {
  const canOpenWeb = Boolean(getWebUrl());
  return (
    <Screen scroll={false}>
      <View style={styles.wrapper}>
        <View style={styles.icon}><Ionicons name="globe-outline" size={38} color={colors.primary} /></View>
        <Text style={styles.title}>Tính năng này dùng trên web</Text>
        <Text style={styles.body}>Vui lòng mở trình duyệt để tiếp tục.</Text>
        {canOpenWeb ? <Button title="Mở web" onPress={() => void openWeb()} /> : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  wrapper: { flex: 1, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg },
  icon: { width: 76, height: 76, borderRadius: radius.lg, backgroundColor: colors.softIndigo, alignItems: "center", justifyContent: "center" },
  title: { color: colors.ink, fontSize: 23, fontWeight: "800", textAlign: "center" },
  body: { color: colors.muted, fontSize: 15, textAlign: "center", lineHeight: 22 },
});
