import { Ionicons } from "@expo/vector-icons";
import { useEvent, useEventListener } from "expo";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { router, useLocalSearchParams } from "expo-router";
import { useVideoPlayer, VideoView } from "expo-video";
import { useCallback, useEffect, useRef, useState } from "react";
import { Alert as NativeAlert, Linking, Pressable, StyleSheet, Text, View } from "react-native";
import { getApiErrorMessage } from "../../api/client";
import { completeLesson, getChat, getLearningCourse, getLearningLesson, getLessonSummary, getQuiz, sendChat, sendWatchEvent } from "../../api/services";
import type { WatchEventType } from "../../api/types";
import { Alert, Button, Card, ErrorState, Header, LoadingState, Screen, SectionHeading, SegmentTabs } from "../../components/ui";
import { LessonSheet } from "../../components/study/lesson-sheet";
import { SummaryPanel } from "../../components/study/summary-panel";
import { colors, radius, spacing } from "../../theme";
import { resolveMediaUrl } from "../../utils/media-url";

type PlayerTab = "content" | "summary";

export default function LearningPlayer() {
  const rawParams = useLocalSearchParams<{ courseId: string; lessonId?: string }>();
  const courseId = String(rawParams.courseId ?? "");
  const requestedLessonId = typeof rawParams.lessonId === "string" ? rawParams.lessonId : null;
  const client = useQueryClient();
  const [tab, setTab] = useState<PlayerTab>("content");
  const [sheetOpen, setSheetOpen] = useState(false);
  const [question, setQuestion] = useState("");
  const sessionId = useRef("");
  const sentEvents = useRef(new Set<string>());
  const positionRef = useRef(0);
  const watchedRef = useRef(0);
  const durationRef = useRef(0);

  const courseQuery = useQuery({ queryKey: ["learning-course", courseId], queryFn: () => getLearningCourse(courseId), enabled: Boolean(courseId) });
  const fallbackLessonId = courseQuery.data?.firstAccessibleLessonId ?? courseQuery.data?.lessons.find((lesson) => lesson.isAccessible)?.id ?? null;
  const selectedLessonId = requestedLessonId && courseQuery.data?.lessons.some((lesson) => lesson.id === requestedLessonId && lesson.isAccessible) ? requestedLessonId : fallbackLessonId;

  const lessonQuery = useQuery({ queryKey: ["lesson", courseId, selectedLessonId], queryFn: () => getLearningLesson(courseId, selectedLessonId as string), enabled: Boolean(courseId && selectedLessonId) });
  const lesson = lessonQuery.data;
  const quizQuery = useQuery({ queryKey: ["quiz", courseId, selectedLessonId], queryFn: () => getQuiz(courseId, selectedLessonId as string), enabled: Boolean(courseId && selectedLessonId) });
  const summaryQuery = useQuery({
    queryKey: ["summary", courseId, selectedLessonId],
    queryFn: () => getLessonSummary(courseId, selectedLessonId as string),
    enabled: tab === "summary" && Boolean(courseId && selectedLessonId),
    refetchInterval: (query) => query.state.data?.status === "pending" || query.state.data?.status === "processing" ? 5000 : false,
  });
  const chatQuery = useQuery({ queryKey: ["chat", courseId], queryFn: () => getChat(courseId), enabled: sheetOpen && Boolean(courseId) });

  const eventMutation = useMutation({
    mutationFn: ({ eventType, positionSeconds }: { eventType: WatchEventType; positionSeconds: number }) => {
      if (!sessionId.current) sessionId.current = createSessionId();
      return sendWatchEvent(courseId, selectedLessonId as string, {
        idempotencyKey: `${sessionId.current}-${selectedLessonId}-${eventType}-${eventType === "heartbeat" ? Math.floor(positionSeconds / 15) : "once"}`,
        eventType,
        positionSeconds: Math.round(positionSeconds),
        watchedSeconds: Math.round(Math.max(watchedRef.current, positionSeconds)),
        durationSeconds: Math.round(durationRef.current),
        clientCreatedAt: new Date().toISOString(),
      });
    },
    onSuccess: () => {
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      void client.invalidateQueries({ queryKey: ["myEnrollments"] });
      void client.invalidateQueries({ queryKey: ["learning-course", courseId] });
      void client.invalidateQueries({ queryKey: ["lesson", courseId, selectedLessonId] });
    },
  });

  const completeMutation = useMutation({
    mutationFn: () => completeLesson(courseId, selectedLessonId as string),
    onSuccess: () => {
      NativeAlert.alert("Đã hoàn thành", "Tiến độ học đã được cập nhật.");
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      void client.invalidateQueries({ queryKey: ["myEnrollments"] });
      void client.invalidateQueries({ queryKey: ["learning-course", courseId] });
      void client.invalidateQueries({ queryKey: ["lesson", courseId, selectedLessonId] });
    },
    onError: (error) => NativeAlert.alert("Không thể cập nhật", getApiErrorMessage(error)),
  });

  const chatMutation = useMutation({
    mutationFn: () => sendChat(courseId, question.trim()),
    onSuccess: () => {
      setQuestion("");
      void chatQuery.refetch();
    },
    onError: (error) => NativeAlert.alert("Gửi câu hỏi thất bại", getApiErrorMessage(error)),
  });

  const videoSource = resolveMediaUrl(lesson?.videoUrl);
  const player = useVideoPlayer(videoSource, (instance) => {
    instance.loop = false;
    instance.timeUpdateEventInterval = 1;
  });
  const { status, error } = useEvent(player, "statusChange", { status: player.status });

  const emitEvent = useCallback((eventType: WatchEventType, positionSeconds: number, bucket: string = "once") => {
    if (!courseId || !selectedLessonId) return;
    const key = `${selectedLessonId}:${eventType}:${bucket}`;
    if (sentEvents.current.has(key)) return;
    sentEvents.current.add(key);
    eventMutation.mutate({ eventType, positionSeconds });
  }, [courseId, eventMutation, selectedLessonId]);

  useEffect(() => {
    sentEvents.current.clear();
    positionRef.current = 0;
    watchedRef.current = 0;
  }, [selectedLessonId]);

  useEffect(() => {
    if (!lesson) return;
    durationRef.current = Math.max(durationRef.current, lesson.duration, player.duration || 0);
    emitEvent("opened", 0);
  }, [emitEvent, lesson, player.duration]);

  useEventListener(player, "timeUpdate", ({ currentTime }) => {
    positionRef.current = currentTime;
    watchedRef.current = Math.max(watchedRef.current, currentTime);
    const duration = Math.max(durationRef.current, player.duration || 0);
    durationRef.current = duration;
    if (!player.playing || duration <= 0) return;
    const bucket = String(Math.floor(currentTime / 15));
    emitEvent("heartbeat", currentTime, bucket);
    if (currentTime / duration >= 0.9) emitEvent("completed", currentTime);
  });

  useEventListener(player, "playingChange", ({ isPlaying }) => {
    if (!isPlaying && positionRef.current > 0) emitEvent("paused", positionRef.current);
  });

  useEventListener(player, "playToEnd", () => {
    const duration = Math.max(durationRef.current, player.duration || 0);
    emitEvent("completed", duration);
  });

  function selectLesson(lessonId: string) {
    setSheetOpen(false);
    router.setParams({ lessonId });
  }

  function openMaterial() {
    const materialUrl = resolveMediaUrl(lesson?.materialUrl);
    if (!materialUrl) return;
    void Linking.openURL(materialUrl).catch(() => NativeAlert.alert("Không mở được tài liệu", "Vui lòng thử lại sau."));
  }

  if (courseQuery.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (courseQuery.isError || !courseQuery.data) return <Screen scroll={false}><ErrorState message="Không tải được nội dung học." onRetry={() => void courseQuery.refetch()} /></Screen>;
  if (!selectedLessonId) return <Screen><Header canGoBack fallbackHref="/(tabs)/courses" /><Alert title="Chưa có bài học" message="Khóa học này chưa có bài học nào có thể truy cập." /></Screen>;
  if (lessonQuery.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (lessonQuery.isError || !lesson) return <Screen scroll={false}><ErrorState message="Không tải được bài học." onRetry={() => void lessonQuery.refetch()} /></Screen>;

  return (
    <Screen>
      <Header canGoBack fallbackHref="/(tabs)/courses" right={
        <View style={styles.headerActions}>
          <Pressable accessibilityRole="button" accessibilityLabel="Danh sách bài học" hitSlop={8} onPress={() => setSheetOpen(true)} style={styles.iconButton}><Ionicons name="list-outline" size={22} color={colors.primary} /></Pressable>
          {quizQuery.data?.quiz ? <Pressable accessibilityRole="button" accessibilityLabel="Làm quiz bài học" hitSlop={8} onPress={() => router.push({ pathname: "/learn/[courseId]/lesson/[lessonId]/quiz", params: { courseId, lessonId: selectedLessonId } })} style={styles.iconButton}><Ionicons name="help-circle-outline" size={22} color={colors.primary} /></Pressable> : null}
          <Pressable accessibilityRole="button" accessibilityLabel={lesson.isCompleted ? "Đã hoàn thành" : "Đánh dấu hoàn thành"} disabled={lesson.isCompleted || completeMutation.isPending} hitSlop={8} onPress={() => completeMutation.mutate()} style={styles.iconButton}><Ionicons name={lesson.isCompleted ? "checkmark-circle" : "checkmark-circle-outline"} size={22} color={lesson.isCompleted ? colors.success : colors.primary} /></Pressable>
        </View>
      } />
      {videoSource ? (
        status === "error" ? (
          <View style={styles.playerError}>
            <Alert title="Không phát được video" message={error?.message ? `Trình phát báo lỗi: ${error.message}` : "Vui lòng kiểm tra kết nối và thử lại."} tone="danger" />
          </View>
        ) : (
          <View style={styles.playerWrap}>
            <VideoView player={player} style={styles.video} contentFit="contain" nativeControls allowsPictureInPicture fullscreenOptions={{ enable: true }} />
          </View>
        )
      ) : (
        <View style={styles.videoPlaceholder}><Ionicons name="videocam-off-outline" size={30} color={colors.muted} /><Text style={styles.muted}>Bài học này chưa có video.</Text></View>
      )}
      <View style={styles.lessonCopy}>
        <BadgeText position={lesson.position} completed={lesson.isCompleted} />
        <Text style={styles.title}>{lesson.title}</Text>
        <Text style={styles.description}>{lesson.description || "Nội dung bài học."}</Text>
      </View>
      <SegmentTabs value={tab} onChange={setTab} options={[{ value: "content", label: "Nội dung", icon: "document-text-outline" }, { value: "summary", label: "Tóm tắt AI", icon: "sparkles-outline" }]} />
      {tab === "summary" ? (
        <SummaryPanel summary={summaryQuery.data} isLoading={summaryQuery.isLoading} onRetry={() => void summaryQuery.refetch()} />
      ) : (
        <View style={styles.stack}>
          <SectionHeading eyebrow="Bài học" title="Nội dung chính" />
          <Card><Text style={styles.bodyText}>{lesson.description || "Hãy xem video bài học để nắm bắt kiến thức trọng tâm."}</Text></Card>
          {lesson.materialUrl ? <Button title="Mở tài liệu bài học" variant="ghost" onPress={openMaterial} /> : null}
        </View>
      )}
      <LessonSheet visible={sheetOpen} onClose={() => setSheetOpen(false)} courseTitle={courseQuery.data.course.title} lessons={courseQuery.data.lessons} selectedLessonId={selectedLessonId} onSelectLesson={selectLesson} chat={chatQuery.data} question={question} onQuestionChange={setQuestion} onSendQuestion={() => chatMutation.mutate()} sending={chatMutation.isPending} />
    </Screen>
  );
}

function createSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

function BadgeText({ position, completed }: { position: number; completed: boolean }) {
  return <View style={[styles.lessonBadge, completed && styles.lessonBadgeDone]}><Text style={styles.lessonBadgeText}>{completed ? "Đã hoàn thành" : `Bài ${position}`}</Text></View>;
}

const styles = StyleSheet.create({
  iconButton: { width: 40, height: 40, alignItems: "center", justifyContent: "center", borderRadius: 20, backgroundColor: colors.softIndigo },
  playerWrap: { borderRadius: radius.md, overflow: "hidden", backgroundColor: "#000" }, playerError: { borderRadius: radius.md }, video: { width: "100%", height: 220 }, videoPlaceholder: { minHeight: 180, borderRadius: radius.md, backgroundColor: colors.softBlue, alignItems: "center", justifyContent: "center", gap: spacing.sm },
  lessonCopy: { gap: spacing.sm }, lessonBadge: { alignSelf: "flex-start", borderRadius: radius.pill, paddingHorizontal: 10, paddingVertical: 5, backgroundColor: colors.softIndigo }, lessonBadgeDone: { backgroundColor: colors.softGreen }, lessonBadgeText: { color: colors.primaryDark, fontSize: 11, fontWeight: "800" }, title: { color: colors.text, fontSize: 23, fontWeight: "800", lineHeight: 29 }, description: { color: colors.mutedForeground, fontSize: 14, lineHeight: 21 }, muted: { color: colors.mutedForeground, fontSize: 13 },
    headerActions: { flexDirection: "row", alignItems: "center", gap: spacing.xs }, stack: { gap: spacing.md }, bodyText:
 { color: colors.mutedForeground, fontSize: 14, lineHeight: 21 },
});
