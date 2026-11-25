import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";
import type { Quiz, QuizAttemptResult, QuizAttemptStartResponse } from "../../api/types";
import { Alert, Badge, Button, Card } from "../ui";
import { colors, radius, spacing } from "../../theme";

export interface QuizWorkspaceProps {
  quiz: Quiz;
  attempt: QuizAttemptStartResponse | null;
  result: QuizAttemptResult | null;
  attempts: QuizAttemptResult[];
  answers: Record<string, number[] | string>;
  onChangeAnswer: (questionId: string, value: number[] | string) => void;
  onStart: () => void;
  onSubmit: () => void;
  starting?: boolean;
  submitting?: boolean;
  remainingSeconds?: number | null;
  validationMessage?: string | null;
}

export function QuizWorkspace({ quiz, attempt, result, attempts, answers, onChangeAnswer, onStart, onSubmit, starting = false, submitting = false, remainingSeconds = null, validationMessage = null }: QuizWorkspaceProps) {
  const [historyOpen, setHistoryOpen] = useState(false);
  const bestScore = attempts.reduce((best, item) => Math.max(best, item.totalScore), 0);

  if (!attempt && !result) {
    return (
      <View style={styles.stack}>
        <Card style={styles.overview}>
          <Text style={styles.overviewTitle}>{quiz.title}</Text>
          <Text style={styles.description}>{quiz.description || "Kiểm tra kiến thức sau bài học."}</Text>
          <View style={styles.infoRow}>
            <Badge>{quiz.questions.length} câu hỏi</Badge>
            <Badge tone="green">{quiz.totalPoints} điểm</Badge>
            <Badge tone="orange">Đạt {quiz.passScore}</Badge>
          </View>
          {quiz.timeLimitMinutes ? <Text style={styles.meta}>Thời gian làm bài: {quiz.timeLimitMinutes} phút</Text> : null}
          <Text style={styles.meta}>Số lượt đã làm: {attempts.length}/3</Text>
        </Card>
        <Button title="Bắt đầu làm bài" onPress={onStart} loading={starting} disabled={attempts.length >= 3} />
        {attempts.length >= 3 ? <Alert tone="warning" title="Đã hết lượt làm bài" message="Vui lòng liên hệ giảng viên nếu cần hỗ trợ." /> : null}
        <AttemptHistory attempts={attempts} bestScore={bestScore} open={historyOpen} onToggle={() => setHistoryOpen((old) => !old)} />
      </View>
    );
  }

  if (result) {
    const passed = result.passed;
    return (
      <View style={styles.stack}>
        <Card style={[styles.resultCard, passed ? styles.resultPassed : styles.resultFailed]}>
          <Ionicons name={passed ? "trophy-outline" : "refresh-outline"} size={38} color={passed ? colors.success : colors.warning} />
          <Text style={styles.resultTitle}>{passed ? "Chúc mừng! Bạn đã đạt" : "Cần cố gắng thêm"}</Text>
          <Text style={styles.score}>{result.totalScore}/{result.totalPoints}</Text>
          <View style={styles.infoRow}>
            <Badge tone="green">Đúng {result.correctCount}</Badge>
            <Badge tone="orange">Sai {result.wrongCount}</Badge>
            <Badge tone="muted">Chờ chấm {result.pendingEssayCount}</Badge>
          </View>
          {result.isLate ? <Alert tone="warning" title={`Nộp trễ ${result.lateSeconds} giây`} /> : null}
        </Card>
        <Button title="Làm lại" onPress={onStart} loading={starting} variant="secondary" disabled={attempts.length >= 3} />
        <AttemptHistory attempts={attempts} bestScore={bestScore} open={historyOpen} onToggle={() => setHistoryOpen((old) => !old)} />
      </View>
    );
  }

  return (
    <View style={styles.stack}>
      {remainingSeconds !== null ? (
        <Alert tone={remainingSeconds <= 60 ? "danger" : "info"} title={`Thời gian còn lại ${formatTime(remainingSeconds)}`} message={remainingSeconds <= 60 ? "Sắp hết giờ, hãy nộp bài sớm." : undefined} />
      ) : null}
      {quiz.questions.map((question, index) => {
        const answer = answers[question.id];
        const selected = Array.isArray(answer) ? answer : [];
        return (
          <Card key={question.id} style={styles.questionCard}>
            <Text style={styles.questionTitle}>{index + 1}. {question.content}</Text>
            <Text style={styles.questionMeta}>{question.points} điểm{question.maxSelectableOptions ? ` · Chọn tối đa ${question.maxSelectableOptions}` : ""}</Text>
            {question.type === "essay" ? (
              <TextInput multiline value={typeof answer === "string" ? answer : ""} onChangeText={(value) => onChangeAnswer(question.id, value)} placeholder="Nhập câu trả lời" placeholderTextColor={colors.muted} style={styles.essay} textAlignVertical="top" />
            ) : (
              <View style={styles.options}>
                {question.options.map((option, optionIndex) => {
                  const active = selected.includes(optionIndex);
                  return (
                    <Pressable key={`${question.id}-${optionIndex}`} accessibilityRole="radio" accessibilityState={{ selected: active }} onPress={() => onChangeAnswer(question.id, toggleSelection(selected, optionIndex, question.maxSelectableOptions))} style={({ pressed }) => [styles.option, pressed && styles.optionPressed]}>
                      <View style={[styles.radio, question.isMultipleChoice && styles.checkbox, active && styles.selected]}>
                        {active ? <Ionicons name="checkmark" size={14} color={colors.white} /> : null}
                      </View>
                      <Text style={styles.optionText}>{option}</Text>
                    </Pressable>
                  );
                })}
              </View>
            )}
          </Card>
        );
      })}
      {validationMessage ? <Alert tone="warning" title={validationMessage} /> : null}
      <Button title="Nộp bài" onPress={onSubmit} loading={submitting} disabled={Boolean(validationMessage) || submitting} />
    </View>
  );
}

function AttemptHistory({ attempts, bestScore, open, onToggle }: { attempts: QuizAttemptResult[]; bestScore: number; open: boolean; onToggle: () => void }) {
  if (!attempts.length) return null;
  return (
    <View style={styles.history}>
      <Pressable onPress={onToggle} style={styles.historyHeader}>
        <Text style={styles.historyTitle}>Lịch sử làm bài ({attempts.length})</Text>
        <Ionicons name={open ? "chevron-up-outline" : "chevron-down-outline"} size={20} color={colors.muted} />
      </Pressable>
      {open ? attempts.map((attempt) => (
        <View key={attempt.attemptId} style={styles.historyRow}>
          <View style={styles.historyRowCopy}>
            <Text style={styles.historyScore}>{attempt.totalScore}/{attempt.totalPoints}</Text>
            <Text style={styles.meta}>{attempt.submittedAt ? new Date(attempt.submittedAt).toLocaleString("vi-VN") : "Chưa nộp"}</Text>
          </View>
          {attempt.totalScore === bestScore ? <Badge tone="green">Tốt nhất</Badge> : <Badge tone={attempt.passed ? "green" : "muted"}>{attempt.passed ? "Đạt" : "Chưa đạt"}</Badge>}
        </View>
      )) : null}
    </View>
  );
}

function toggleSelection(selected: number[], optionIndex: number, maxSelectableOptions: number | null) {
  if (selected.includes(optionIndex)) return selected.filter((item) => item !== optionIndex);
  if (maxSelectableOptions && selected.length >= maxSelectableOptions) return selected;
  return [...selected, optionIndex];
}

function formatTime(seconds: number) {
  const minutes = Math.floor(Math.max(seconds, 0) / 60);
  const rest = Math.max(seconds, 0) % 60;
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}

const styles = StyleSheet.create({
  stack: { gap: spacing.md },
  overview: { gap: spacing.md }, overviewTitle: { color: colors.text, fontSize: 20, fontWeight: "800" }, description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21 }, infoRow: { flexDirection: "row", flexWrap: "wrap", gap: spacing.sm }, meta: { color: colors.mutedForeground, fontSize: 12 },
  resultCard: { alignItems: "center", gap: spacing.sm }, resultPassed: { backgroundColor: colors.successSoft }, resultFailed: { backgroundColor: colors.softOrange }, resultTitle: { color: colors.text, fontSize: 18, fontWeight: "800", textAlign: "center" }, score: { color: colors.text, fontSize: 36, fontWeight: "800" },
  questionCard: { gap: spacing.sm }, questionTitle: { color: colors.text, fontSize: 15, fontWeight: "700", lineHeight: 21 }, questionMeta: { color: colors.mutedForeground, fontSize: 12 }, options: { gap: spacing.xs }, option: { minHeight: 48, flexDirection: "row", alignItems: "center", gap: spacing.sm }, optionPressed: { opacity: 0.7 }, radio: { width: 22, height: 22, borderRadius: 11, borderWidth: 2, borderColor: colors.border, alignItems: "center", justifyContent: "center" }, checkbox: { borderRadius: 6 }, selected: { borderColor: colors.primary, backgroundColor: colors.primary }, optionText: { flex: 1, color: colors.text, lineHeight: 20 },
  essay: { minHeight: 110, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, padding: spacing.md, color: colors.text, backgroundColor: colors.surface },
  history: { gap: spacing.sm, padding: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.card }, historyHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between" }, historyTitle: { color: colors.text, fontSize: 15, fontWeight: "800" }, historyRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", gap: spacing.sm, paddingVertical: spacing.sm, borderTopWidth: 1, borderColor: colors.border }, historyRowCopy: { gap: 3 }, historyScore: { color: colors.text, fontSize: 14, fontWeight: "800" },
});
