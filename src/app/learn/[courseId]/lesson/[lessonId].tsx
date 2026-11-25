import { router, useLocalSearchParams } from "expo-router";
import { useEffect } from "react";
import { Alert, Screen } from "../../../../components/ui";

export default function LessonRedirect() {
  const { courseId, lessonId } = useLocalSearchParams<{ courseId: string; lessonId: string }>();
  useEffect(() => {
    if (!courseId || !lessonId) return;
    router.replace({ pathname: "/learn/[courseId]", params: { courseId, lessonId } });
  }, [courseId, lessonId]);
  return <Screen scroll={false}>{courseId && lessonId ? <Alert title="Đang mở bài học" message="Vui lòng đợi trong giây lát." /> : <Alert tone="warning" title="Thiếu thông tin bài học" message="Vui lòng chọn bài học từ khóa học." />}</Screen>;
}
