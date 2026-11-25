import { useLocalSearchParams } from "expo-router";
import { CourseDetailContent } from "../../components/course/course-detail-content";

export default function CourseDetail() {
  const { courseId } = useLocalSearchParams<{ courseId: string }>();
  return <CourseDetailContent courseId={courseId ?? ""} />;
}
