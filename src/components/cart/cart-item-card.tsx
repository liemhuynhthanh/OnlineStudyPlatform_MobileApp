import { Image, StyleSheet, Text, View } from "react-native";
import type { CartItem } from "../../api/types";
import { Badge, Button, Card, formatVnd } from "../ui";
import { colors, spacing } from "../../theme";

export function CartItemCard({ item, removing, onRemove }: { item: CartItem; removing: boolean; onRemove: () => void }) {
  return (
    <Card style={styles.card}>
      <View style={styles.top}>
        {item.course.thumbnail ? <Image source={{ uri: item.course.thumbnail }} style={styles.thumbnail} /> : <View style={[styles.thumbnail, styles.placeholder]} />}
        <View style={styles.copy}>
          <Badge>{item.course.category}</Badge>
          <Text style={styles.title} numberOfLines={2}>{item.course.title}</Text>
          <Text style={styles.instructor}>{item.course.instructor?.name ?? "Giảng viên đang cập nhật"}</Text>
          <Text style={styles.price}>{formatVnd(item.course.price)}</Text>
        </View>
      </View>
      <Button title="Xóa khỏi giỏ hàng" variant="ghost" loading={removing} disabled={removing} onPress={onRemove} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  top: { flexDirection: "row", gap: spacing.md },
  thumbnail: { width: 82, height: 82, borderRadius: 12, backgroundColor: colors.softBlue },
  placeholder: { alignItems: "center", justifyContent: "center" },
  copy: { flex: 1, gap: 5 },
  title: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 21 },
  instructor: { color: colors.muted, fontSize: 12 },
  price: { color: colors.success, fontSize: 14, fontWeight: "800" },
});
