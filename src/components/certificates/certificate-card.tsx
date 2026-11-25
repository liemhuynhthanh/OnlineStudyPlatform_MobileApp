import { StyleSheet, Text } from "react-native";
import type { LearnerCertificate } from "../../api/types";
import { Badge, Button, Card, formatDate } from "../ui";
import { colors, spacing } from "../../theme";

export function CertificateCard({ item, downloading, onDownload }: { item: LearnerCertificate; downloading: boolean; onDownload: () => void }) {
  return (
    <Card style={styles.card}>
      <Badge tone="green">Đã cấp chứng chỉ</Badge>
      <Text style={styles.title}>{item.courseTitle}</Text>
      <Text style={styles.learner}>{`Học viên: ${item.learnerName}`}</Text>
      <Text style={styles.issued}>{`Cấp ngày ${formatDate(item.issuedAt)}`}</Text>
      <Button title={downloading ? "Đang tải chứng chỉ..." : "Tải chứng chỉ PDF"} loading={downloading} disabled={downloading} onPress={onDownload} />
    </Card>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.sm },
  title: { color: colors.text, fontSize: 17, fontWeight: "800", lineHeight: 23 },
  learner: { color: colors.mutedForeground, fontSize: 14 },
  issued: { color: colors.muted, fontSize: 13 },
});
