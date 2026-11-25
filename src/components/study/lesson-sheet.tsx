import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import type { ChatSession, LearningCourse } from "../../api/types";
import { PaginationRow } from "../catalog/pagination-row";
import { Alert, Button, SegmentTabs } from "../ui";
import { useLocalPagination } from "../../hooks/use-local-pagination";
import { colors, radius, spacing } from "../../theme";

type SheetTab = "lessons" | "chat";

export function LessonSheet({ visible, onClose, courseTitle, lessons, selectedLessonId, onSelectLesson, chat, question, onQuestionChange, onSendQuestion, sending }: { visible: boolean; onClose: () => void; courseTitle: string; lessons: LearningCourse["lessons"]; selectedLessonId: string | null; onSelectLesson: (lessonId: string) => void; chat?: ChatSession; question: string; onQuestionChange: (value: string) => void; onSendQuestion: () => void; sending?: boolean }) {
  const [tab, setTab] = useState<SheetTab>("lessons");
  const canChat = chat?.isAiAvailable ?? false;
  const pagination = useLocalPagination(lessons);

  return (
    <Modal visible={visible} animationType="slide" transparent onRequestClose={onClose}>
      <Pressable accessibilityLabel="Đóng" onPress={onClose} style={styles.backdrop} />
      <View style={styles.sheet}>
        <View style={styles.handle} />
        <View style={styles.header}>
          <View style={styles.headerCopy}>
            <Text style={styles.eyebrow}>Nội dung khóa học</Text>
            <Text style={styles.title} numberOfLines={1}>{courseTitle}</Text>
          </View>
          <Pressable accessibilityRole="button" accessibilityLabel="Đóng" hitSlop={8} onPress={onClose} style={styles.close}><Ionicons name="close" size={22} color={colors.ink} /></Pressable>
        </View>
        <SegmentTabs value={tab} onChange={setTab} options={[{ value: "lessons", label: "Bài học", icon: "list-outline" }, { value: "chat", label: "Hỏi AI", icon: "chatbubble-outline" }]} />
        {tab === "lessons" ? (
          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {pagination.visibleItems.map((lesson) => {
              const active = lesson.id === selectedLessonId;
              return (
                <Pressable key={lesson.id} accessibilityRole="button" disabled={!lesson.isAccessible} onPress={() => onSelectLesson(lesson.id)} style={({ pressed }) => [styles.lessonRow, active && styles.lessonActive, pressed && styles.rowPressed, !lesson.isAccessible && styles.lessonLocked]}>
                  <View style={[styles.lessonNumber, active && styles.lessonNumberActive, lesson.isCompleted && styles.lessonNumberDone]}>
                    <Text style={styles.lessonNumberText}>{lesson.isCompleted ? "✓" : lesson.position}</Text>
                  </View>
                  <View style={styles.lessonCopy}>
                    <Text style={styles.lessonTitle} numberOfLines={2}>{lesson.title}</Text>
                    <Text style={styles.lessonMeta}>{Math.round(lesson.duration / 60)} phút{!lesson.isAccessible && lesson.blockedReason ? ` · ${lesson.blockedReason}` : ""}</Text>
                  </View>
                  {active ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
                </Pressable>
              );
            })}
            {pagination.totalPages > 1 ? <PaginationRow page={pagination.page} totalPages={pagination.totalPages} total={pagination.total} onChange={pagination.setPage} /> : null}
          </ScrollView>
        ) : (
          <View style={styles.chatBody}>
            {!canChat ? <Alert title="AI chưa sẵn sàng" message="Tính năng hỏi AI chưa khả dụng cho khóa học này." /> : null}
            <ScrollView style={styles.chatList} showsVerticalScrollIndicator={false}>
              {chat?.messages.length ? chat.messages.slice(-20).map((message) => (
                <View key={message.id} style={[styles.message, message.role === "user" && styles.messageUser]}>
                  <Text style={styles.messageRole}>{message.role === "user" ? "Bạn" : "Trợ lý AI"}</Text>
                  <Text style={styles.messageText}>{message.content}</Text>
                  {message.citations.length ? <Text style={styles.citation}>{message.citations.length} nguồn tham khảo</Text> : null}
                </View>
              )) : <Text style={styles.chatEmpty}>Đặt câu hỏi về nội dung bài học để bắt đầu.</Text>}
            </ScrollView>
            <TextInput value={question} onChangeText={onQuestionChange} maxLength={1000} multiline placeholder="Nhập câu hỏi (tối đa 1000 ký tự)" placeholderTextColor={colors.muted} style={styles.chatInput} textAlignVertical="top" editable={canChat && !sending} />
            <View style={styles.chatFooter}>
              <Text style={styles.charCount}>{question.length}/1000</Text>
              <Button title="Gửi" onPress={onSendQuestion} loading={sending} disabled={!canChat || !question.trim() || sending} />
            </View>
          </View>
        )}
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: { position: "absolute", inset: 0, backgroundColor: "#17172F88" },
  sheet: { position: "absolute", left: 0, right: 0, bottom: 0, maxHeight: "86%", minHeight: "60%", paddingHorizontal: spacing.md, paddingBottom: spacing.md, borderTopLeftRadius: radius.lg, borderTopRightRadius: radius.lg, backgroundColor: colors.background },
  handle: { alignSelf: "center", width: 42, height: 4, borderRadius: 2, backgroundColor: colors.border, marginVertical: spacing.sm },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md, marginBottom: spacing.md }, headerCopy: { flex: 1, gap: 3 }, eyebrow: { color: colors.primary, fontSize: 11, fontWeight: "800", textTransform: "uppercase", letterSpacing: 1 }, title: { color: colors.text, fontSize: 20, fontWeight: "800" }, close: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.surface },
  body: { flex: 1, marginTop: spacing.md }, lessonRow: { flexDirection: "row", alignItems: "center", gap: spacing.md, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm }, lessonActive: { borderColor: colors.primary, backgroundColor: colors.softIndigo }, rowPressed: { opacity: 0.75 }, lessonLocked: { opacity: 0.55 }, lessonNumber: { width: 34, height: 34, borderRadius: 17, alignItems: "center", justifyContent: "center", backgroundColor: colors.border }, lessonNumberActive: { backgroundColor: colors.primary }, lessonNumberDone: { backgroundColor: colors.softGreen }, lessonNumberText: { color: colors.text, fontWeight: "800" }, lessonCopy: { flex: 1, gap: 3 }, lessonTitle: { color: colors.text, fontSize: 14, fontWeight: "700" }, lessonMeta: { color: colors.mutedForeground, fontSize: 12 },
  chatBody: { flex: 1, marginTop: spacing.md, gap: spacing.sm }, chatList: { flex: 1 }, message: { alignSelf: "flex-start", maxWidth: "88%", gap: 4, padding: spacing.md, borderRadius: radius.md, backgroundColor: colors.surface, marginBottom: spacing.sm }, messageUser: { alignSelf: "flex-end", backgroundColor: colors.softIndigo }, messageRole: { color: colors.primary, fontSize: 11, fontWeight: "800" }, messageText: { color: colors.text, fontSize: 14, lineHeight: 20 }, citation: { color: colors.mutedForeground, fontSize: 11 }, chatEmpty: { color: colors.mutedForeground, textAlign: "center", paddingVertical: spacing.xl }, chatInput: { minHeight: 84, maxHeight: 140, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.surface, color: colors.text }, chatFooter: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.md }, charCount: { color: colors.mutedForeground, fontSize: 11 },
});
