import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { getApiErrorMessage } from "../../../../../api/client";
import { getQuiz, listQuizAttempts, startQuiz, submitQuiz } from "../../../../../api/services";
import type { Quiz, QuizAnswerPayload, QuizAttemptResult, QuizAttemptStartResponse } from "../../../../../api/types";
import { Alert, EmptyState, ErrorState, Header, LoadingState, Screen } from "../../../../../components/ui";
import { QuizWorkspace } from "../../../../../components/study/quiz-workspace";

export default function QuizScreen() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  const client = useQueryClient();
  const [attempt, setAttempt] = useState<QuizAttemptStartResponse | null>(null);
  const [activeQuiz, setActiveQuiz] = useState<Quiz | null>(null);
  const [result, setResult] = useState<QuizAttemptResult | null>(null);
  const [answers, setAnswers] = useState<Record<string, number[] | string>>({});
  const [clockTick, setClockTick] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const quizQuery = useQuery({ queryKey: ["quiz", courseId, lessonId], queryFn: () => getQuiz(courseId, lessonId), enabled: Boolean(courseId && lessonId) });
  const attemptsQuery = useQuery({ queryKey: ["quiz-attempts", courseId, lessonId, quizQuery.data?.quiz?.id], queryFn: () => listQuizAttempts(courseId, lessonId, quizQuery.data?.quiz?.id ?? ""), enabled: Boolean(courseId && lessonId && quizQuery.data?.quiz) });

  const start = useMutation({
    mutationFn: () => {
      const quiz = activeQuiz ?? quizQuery.data?.quiz;
      if (!quiz) throw new Error("Quiz chưa sẵn sàng");
      return startQuiz(courseId, lessonId, quiz.id);
    },
    onSuccess: (data) => {
      setAttempt(data);
      setActiveQuiz(data.quiz);
      setResult(null);
      setAnswers({});
      setClockTick(Date.now());
      setErrorMessage(null);
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  });

  const submit = useMutation({
    mutationFn: () => {
      const quiz = activeQuiz ?? quizQuery.data?.quiz;
      if (!quiz || !attempt) throw new Error("Chưa bắt đầu bài làm");
      const payload: QuizAnswerPayload[] = quiz.questions.map((question) => {
        const answer = answers[question.id];
        if (question.type === "essay") return { questionId: question.id, text: typeof answer === "string" ? answer : "" };
        return { questionId: question.id, selectedOptionIndexes: Array.isArray(answer) ? answer : [] };
      });
      return submitQuiz(courseId, lessonId, quiz.id, attempt.attemptId, payload);
    },
    onSuccess: (data) => {
      setResult(data);
      setErrorMessage(null);
      void attemptsQuery.refetch();
      void client.invalidateQueries({ queryKey: ["dashboard"] });
      void client.invalidateQueries({ queryKey: ["myEnrollments"] });
    },
    onError: (error) => setErrorMessage(getApiErrorMessage(error)),
  });

  useEffect(() => {
    if (!attempt?.timeLimitMinutes) return;
    const interval = setInterval(() => setClockTick(Date.now()), 1000);
    return () => clearInterval(interval);
  }, [attempt]);

  const remainingSeconds = attempt?.timeLimitMinutes ? Math.max(0, Math.ceil(attempt.timeLimitMinutes * 60 - (clockTick - new Date(attempt.startedAt).getTime()) / 1000)) : null;

  if (quizQuery.isLoading) return <Screen scroll={false}><LoadingState /></Screen>;
  if (quizQuery.isError || !quizQuery.data) return <Screen scroll={false}><ErrorState message="Không tải được quiz." onRetry={() => void quizQuery.refetch()} /></Screen>;
  const quiz = activeQuiz ?? quizQuery.data.quiz;
  if (!quiz) return <Screen><Header title="Quiz" canGoBack fallbackHref="/(tabs)/courses" /><EmptyState title="Chưa có quiz" message="Bài học này chưa có quiz." icon="help-circle-outline" /></Screen>;

  return (
    <Screen>
      <Header title={quiz.title} canGoBack fallbackHref="/(tabs)/courses" />
      {errorMessage ? <Alert tone="danger" title="Có lỗi xảy ra" message={errorMessage} /> : null}
      <QuizWorkspace
        quiz={quiz}
        attempt={attempt}
        result={result}
        attempts={attemptsQuery.data ?? []}
        answers={answers}
        onChangeAnswer={(questionId, value) => setAnswers((old) => ({ ...old, [questionId]: value }))}
        onStart={() => start.mutate()}
        onSubmit={() => submit.mutate()}
        starting={start.isPending}
        submitting={submit.isPending}
        remainingSeconds={remainingSeconds}
        validationMessage={getValidationMessage(quiz, answers)}
      />
    </Screen>
  );
}

function getValidationMessage(quiz: Quiz, answers: Record<string, number[] | string>) {
  for (const question of quiz.questions) {
    const answer = answers[question.id];
    if (question.type === "essay" && !String(answer ?? "").trim()) return `Câu ${question.position} chưa có câu trả lời.`;
    if (question.type !== "essay" && (!Array.isArray(answer) || answer.length === 0)) return `Câu ${question.position} chưa được chọn.`;
  }
  return null;
}
