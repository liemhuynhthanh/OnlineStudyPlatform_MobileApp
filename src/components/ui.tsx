import { Ionicons } from "@expo/vector-icons";
import { router } from "expo-router";
import type { ReactNode } from "react";
import { ActivityIndicator, Image, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { colors, radius, spacing } from "../theme";

export { SegmentTabs } from "./study/segment-tabs";
export type { SegmentTabOption } from "./study/segment-tabs";

export function Screen({ children, scroll = true }: { children: ReactNode; scroll?: boolean }) {
  return (
    <SafeAreaView style={styles.safe}>
      {scroll ? (
        <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled" horizontal={false} showsHorizontalScrollIndicator={false} showsVerticalScrollIndicator={false}>
          {children}
        </ScrollView>
      ) : children}
    </SafeAreaView>
  );
}

export function Header({ canGoBack = false, fallbackHref = "/(tabs)", right }: { canGoBack?: boolean; fallbackHref?: string; right?: ReactNode }) {
  function handleBack() {
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(fallbackHref);
  }

  return (
    <View style={styles.header}>
      <View style={styles.headerLeading}>
        {canGoBack ? (
          <Pressable accessibilityRole="button" accessibilityLabel="Quay lại" hitSlop={10} onPress={handleBack} style={styles.iconButton}>
            <Ionicons name="arrow-back" size={22} color={colors.ink} />
          </Pressable>
        ) : null}
        <View style={styles.brand}>
          <View style={styles.brandMark}><Ionicons name="school-outline" size={17} color={colors.white} /></View>
          <Text style={styles.brandText} numberOfLines={1}>E-Learning</Text>
        </View>
      </View>
      {right ?? <View style={styles.headerSpacer} />}
    </View>
  );
}

export function Button({ title, onPress, variant = "primary", loading = false, disabled = false }: { title: string; onPress: () => void; variant?: "primary" | "secondary" | "ghost" | "danger" | "light"; loading?: boolean; disabled?: boolean }) {
  const filled = variant === "primary" || variant === "danger";
  return (
    <Pressable accessibilityRole="button" accessibilityLabel={title} disabled={disabled || loading} onPress={onPress} style={({ pressed }) => [styles.button, variant === "secondary" && styles.buttonSecondary, variant === "ghost" && styles.buttonGhost, variant === "danger" && styles.buttonDanger, variant === "light" && styles.buttonLight, (disabled || loading) && styles.buttonDisabled, pressed && styles.buttonPressed]}>
      {loading ? <ActivityIndicator color={filled || variant === "light" ? colors.white : colors.primary} /> : <Text style={[styles.buttonText, !filled && variant !== "light" && styles.buttonTextSecondary, variant === "light" && styles.buttonTextLight]}>{title}</Text>}
    </Pressable>
  );
}

export function Field({ label, value, onChangeText, placeholder, secureTextEntry = false, keyboardType = "default" }: { label: string; value: string; onChangeText: (value: string) => void; placeholder?: string; secureTextEntry?: boolean; keyboardType?: "default" | "email-address" | "numeric" }) {
  return <View style={styles.field}><Text style={styles.label}>{label}</Text><TextInput accessibilityLabel={label} value={value} onChangeText={onChangeText} placeholder={placeholder} placeholderTextColor={colors.muted} secureTextEntry={secureTextEntry} keyboardType={keyboardType} autoCapitalize={keyboardType === "email-address" ? "none" : "sentences"} style={styles.input} /></View>;
}

export function Card({ children, onPress, style }: { children: ReactNode; onPress?: () => void; style?: object }) {
  const content = <View style={[styles.card, style]}>{children}</View>;
  return onPress ? <Pressable onPress={onPress} style={({ pressed }) => [pressed && styles.cardPressed]}>{content}</Pressable> : content;
}

export function Badge({ children, tone = "indigo" }: { children: ReactNode; tone?: "indigo" | "green" | "orange" | "muted" }) {
  return <View style={[styles.badge, tone === "green" && styles.badgeGreen, tone === "orange" && styles.badgeOrange, tone === "muted" && styles.badgeMuted]}><Text style={styles.badgeText} numberOfLines={2}>{children}</Text></View>;
}

export function SectionHeading({ eyebrow, title, action, onAction }: { eyebrow?: string; title: string; action?: string; onAction?: () => void }) {
  return <View style={styles.sectionHeading}><View style={styles.sectionHeadingCopy}>{eyebrow ? <Text style={styles.eyebrow}>{eyebrow}</Text> : null}<Text style={styles.sectionTitle} numberOfLines={2}>{title}</Text></View>{action ? <Pressable style={styles.sectionAction} onPress={onAction}><Text style={styles.link} numberOfLines={1}>{action}</Text></Pressable> : null}</View>;
}

export function ProgressBar({ value }: { value: number }) {
  const progress = Math.min(Math.max(value, 0), 100);
  return <View style={styles.progressTrack}><View style={[styles.progressFill, { width: `${progress}%` }]} /></View>;
}

export function StatTile({ label, value, icon, iconColor = colors.primary }: { label: string; value: string | number; icon?: keyof typeof Ionicons.glyphMap; iconColor?: string }) {
  return (
    <View style={styles.statTile}>
      {icon ? <View style={[styles.statIcon, { backgroundColor: iconColor === colors.success ? colors.successSoft : colors.softIndigo }]}><Ionicons name={icon} size={20} color={iconColor} /></View> : null}
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={2}>{label}</Text>
    </View>
  );
}

export function Alert({ title, message, tone = "info", actionLabel, onAction }: { title: string; message?: string; tone?: "info" | "success" | "warning" | "danger"; actionLabel?: string; onAction?: () => void }) {
  const icon = tone === "success" ? "checkmark-circle-outline" : tone === "warning" ? "warning-outline" : tone === "danger" ? "alert-circle-outline" : "information-circle-outline";
  return (
    <View style={[styles.alert, tone === "success" && styles.alertSuccess, tone === "warning" && styles.alertWarning, tone === "danger" && styles.alertDanger]}>
      <Ionicons name={icon} size={20} color={tone === "success" ? colors.success : tone === "warning" ? colors.warning : tone === "danger" ? colors.danger : colors.primary} />
      <View style={styles.alertCopy}><Text style={styles.alertTitle}>{title}</Text>{message ? <Text style={styles.alertMessage}>{message}</Text> : null}</View>
      {actionLabel ? <Pressable onPress={onAction}><Text style={styles.alertAction}>{actionLabel}</Text></Pressable> : null}
    </View>
  );
}

export function Skeleton({ width = "100%", height = 16, borderRadius = 8 }: { width?: number | `${number}%`; height?: number; borderRadius?: number }) {
  return <View style={[styles.skeleton, { width, height, borderRadius }]} />;
}

export function LoadingState() { return <View style={styles.center}><ActivityIndicator size="large" color={colors.primary} /></View>; }
export function ErrorState({ message, onRetry }: { message: string; onRetry?: () => void }) { return <View style={styles.center}><Ionicons name="cloud-offline-outline" size={42} color={colors.muted} /><Text style={styles.errorText}>{message}</Text>{onRetry ? <Button title="Thử lại" onPress={onRetry} variant="secondary" /> : null}</View>; }
export function EmptyState({ title, message, icon = "file-tray-outline", actionLabel, onAction }: { title: string; message: string; icon?: keyof typeof Ionicons.glyphMap; actionLabel?: string; onAction?: () => void }) { return <View style={styles.empty}><Ionicons name={icon} size={40} color={colors.muted} /><Text style={styles.emptyTitle}>{title}</Text><Text style={styles.muted}>{message}</Text>{actionLabel ? <Button title={actionLabel} onPress={() => onAction?.()} variant="secondary" /> : null}</View>; }

export function CourseCard({ title, category, price, thumbnail, progress, instructor, onPress }: { title: string; category: string; price: number; thumbnail: string | null; progress?: number; instructor?: string | null; onPress: () => void }) {
  return <Card onPress={onPress} style={styles.courseCard}>{thumbnail ? <Image source={{ uri: thumbnail }} style={styles.courseImage} /> : <View style={[styles.courseImage, styles.imagePlaceholder]}><Ionicons name="book-outline" size={27} color={colors.primary} /></View>}<View style={styles.courseBody}><Badge>{category}</Badge><Text style={styles.courseTitle} numberOfLines={2}>{title}</Text>{instructor ? <Text style={styles.courseInstructor} numberOfLines={2}>{instructor}</Text> : null}{progress !== undefined ? <View style={styles.courseProgress}><ProgressBar value={progress} /><Text style={styles.progressLabel}>{Math.round(progress)}%</Text></View> : <Text style={styles.coursePrice}>{price === 0 ? "Miễn phí" : formatVnd(price)}</Text>}</View><Ionicons name="arrow-forward" size={20} color={colors.primary} /></Card>;
}

export function StudyCourseCard({ title, category, thumbnail, progressPercent, status, instructorName, bestQuizScorePercent, onPress }: { title: string; category: string; thumbnail: string | null; progressPercent: number; status: "in_progress" | "completed"; instructorName: string | null; bestQuizScorePercent?: number | null; onPress: () => void }) {
  return (
    <Card onPress={onPress} style={styles.studyCourseCard}>
      <View style={styles.studyCourseTop}>
        {thumbnail ? <Image source={{ uri: thumbnail }} style={styles.studyCourseImage} /> : <View style={[styles.studyCourseImage, styles.imagePlaceholder]}><Ionicons name="book-outline" size={24} color={colors.primary} /></View>}
        <View style={styles.studyCourseBody}>
          <Badge tone={status === "completed" ? "green" : "indigo"}>{status === "completed" ? "Hoàn thành" : "Đang học"}</Badge>
          <Text style={styles.studyCourseTitle} numberOfLines={2}>{title}</Text>
          <Text style={styles.courseInstructor} numberOfLines={2}>{category}{instructorName ? ` · ${instructorName}` : ""}</Text>
        </View>
      </View>
      <View style={styles.studyCourseFooter}>
        <ProgressBar value={progressPercent} />
        <Text style={styles.progressLabel}>{Math.round(progressPercent)}%</Text>
      </View>
      {bestQuizScorePercent !== undefined && bestQuizScorePercent !== null ? <Text style={styles.quizHint}>Quiz tốt nhất: {Math.round(bestQuizScorePercent)}%</Text> : null}
    </Card>
  );
}

export function formatVnd(value: number) { return `${new Intl.NumberFormat("vi-VN").format(value)} đ`; }
export function formatDate(value: string) { return new Date(value).toLocaleDateString("vi-VN"); }

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background }, content: { width: "100%", maxWidth: 720, alignSelf: "center", padding: spacing.md, gap: spacing.md, paddingBottom: 42 },
  header: { minHeight: 56, flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: spacing.md, backgroundColor: colors.background }, headerLeading: { flexDirection: "row", alignItems: "center", gap: spacing.xs, flexShrink: 1, minWidth: 0 }, headerSpacer: { width: 40 }, iconButton: { minWidth: 44, minHeight: 44, alignItems: "center", justifyContent: "center" }, brand: { flexDirection: "row", alignItems: "center", gap: 6, flexShrink: 1, minWidth: 0 }, brandMark: { width: 28, height: 28, alignItems: "center", justifyContent: "center", borderRadius: 9, backgroundColor: colors.primary }, brandText: { color: colors.ink, fontSize: 14, lineHeight: 18, fontWeight: "800" },
  button: { minHeight: 48, borderRadius: radius.md, alignItems: "center", justifyContent: "center", paddingHorizontal: spacing.md, backgroundColor: colors.primary }, buttonSecondary: { backgroundColor: colors.softBlue, borderWidth: 1, borderColor: "#D8D9FF" }, buttonGhost: { backgroundColor: "transparent" }, buttonDanger: { backgroundColor: colors.danger }, buttonLight: { backgroundColor: colors.white }, buttonDisabled: { opacity: 0.5 }, buttonPressed: { opacity: 0.8 }, buttonText: { color: colors.white, fontSize: 15, fontWeight: "700" }, buttonTextSecondary: { color: colors.primary }, buttonTextLight: { color: colors.navy },
  field: { gap: spacing.xs }, label: { color: colors.ink, fontSize: 14, fontWeight: "600" }, input: { minHeight: 52, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, paddingHorizontal: spacing.md, color: colors.ink, fontSize: 16 },
  card: { borderRadius: radius.lg, padding: spacing.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: spacing.sm }, cardPressed: { opacity: 0.88 }, badge: { alignSelf: "flex-start", maxWidth: "100%", flexShrink: 1, borderRadius: radius.pill, paddingHorizontal: 9, paddingVertical: 5, backgroundColor: colors.softIndigo }, badgeGreen: { backgroundColor: colors.softGreen }, badgeOrange: { backgroundColor: colors.softOrange }, badgeMuted: { backgroundColor: colors.border }, badgeText: { color: colors.primaryDark, fontSize: 11, lineHeight: 14, fontWeight: "800", textTransform: "uppercase", letterSpacing: 0.4 },
  sectionHeading: { flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", gap: spacing.md, marginTop: spacing.sm }, sectionHeadingCopy: { flex: 1, minWidth: 0, gap: 5 }, eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", letterSpacing: 1.4, textTransform: "uppercase" }, sectionTitle: { color: colors.ink, fontSize: 22, lineHeight: 26, fontWeight: "800", letterSpacing: -0.3, flexShrink: 1 }, sectionAction: { flexShrink: 1, maxWidth: "50%" }, link: { color: colors.primary, fontSize: 13, fontWeight: "800", textAlign: "right" }, progressTrack: { height: 7, borderRadius: 5, backgroundColor: colors.border, overflow: "hidden", flex: 1 }, progressFill: { height: "100%", borderRadius: 5, backgroundColor: colors.primary },
  center: { flex: 1, minHeight: 260, alignItems: "center", justifyContent: "center", gap: spacing.md, padding: spacing.lg }, errorText: { color: colors.danger, textAlign: "center", fontSize: 15 }, empty: { alignItems: "center", gap: spacing.sm, paddingVertical: spacing.xl }, emptyTitle: { color: colors.ink, fontSize: 17, fontWeight: "700" }, muted: { color: colors.mutedForeground, fontSize: 14, textAlign: "center", maxWidth: "100%" },
  courseCard: { flexDirection: "row", alignItems: "center", gap: spacing.md }, courseImage: { width: 76, height: 76, borderRadius: radius.md, backgroundColor: colors.softBlue }, imagePlaceholder: { alignItems: "center", justifyContent: "center" }, courseBody: { flex: 1, minWidth: 0, gap: 5 }, courseTitle: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 21 }, courseInstructor: { color: colors.muted, fontSize: 12 }, coursePrice: { color: colors.success, fontSize: 14, fontWeight: "800" }, courseProgress: { flexDirection: "row", alignItems: "center", gap: spacing.sm, marginTop: 3 }, progressLabel: { color: colors.muted, fontSize: 12, fontWeight: "700", width: 42, textAlign: "right" },
  statTile: { flex: 1, minWidth: 0, minHeight: 112, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, gap: spacing.sm }, statIcon: { width: 34, height: 34, borderRadius: 12, alignItems: "center", justifyContent: "center" }, statValue: { color: colors.text, fontSize: 23, fontWeight: "800" }, statLabel: { color: colors.mutedForeground, fontSize: 12, lineHeight: 16 },
  alert: { flexDirection: "row", alignItems: "flex-start", gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.softBlue }, alertSuccess: { backgroundColor: colors.successSoft }, alertWarning: { backgroundColor: colors.softOrange }, alertDanger: { backgroundColor: colors.destructiveSoft }, alertCopy: { flex: 1, minWidth: 0, gap: 3 }, alertTitle: { color: colors.text, fontSize: 14, fontWeight: "800" }, alertMessage: { color: colors.mutedForeground, fontSize: 13, lineHeight: 19 }, alertAction: { color: colors.primary, fontSize: 13, fontWeight: "800" },
  skeleton: { backgroundColor: colors.border },
  studyCourseCard: { gap: spacing.md }, studyCourseTop: { flexDirection: "row", gap: spacing.md }, studyCourseImage: { width: 64, height: 64, borderRadius: radius.sm, backgroundColor: colors.softBlue }, studyCourseBody: { flex: 1, minWidth: 0, gap: 5 }, studyCourseTitle: { color: colors.text, fontSize: 16, fontWeight: "800", lineHeight: 21 }, studyCourseFooter: { flexDirection: "row", alignItems: "center", gap: spacing.sm }, quizHint: { color: colors.mutedForeground, fontSize: 12 },
});
