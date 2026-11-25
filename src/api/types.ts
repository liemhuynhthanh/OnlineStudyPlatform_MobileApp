export interface ApiSuccessResponse<T> { success: true; statusCode: number; data: T; timestamp: string }
export type UserRole = "Admin" | "Instructor" | "Learner";
export type UserStatus = "Active" | "Inactive" | "PendingVerification";
export type EmailDelivery = "sent" | "unavailable";
export interface RegisterUserPayload { name: string; email: string; password: string }
export interface RegisterUserResponse { user: UserProfile; email: string; expiresInSeconds: number; resendCooldownSeconds: number; emailDelivery: EmailDelivery }
export interface UserProfile { id: string; name: string; email: string; role: UserRole; avatar: string | null; status: UserStatus; createdAt: string; updatedAt: string }
export interface AuthResponse { accessToken: string; refreshToken?: string; user: UserProfile }
export interface CurrentUserResponse { id: string; email: string; role: UserRole; status: UserStatus }
export interface VerifyEmailPayload { email: string; otp: string }
export interface ResendEmailOtpPayload { email: string }
export interface EmailOtpDispatchResponse { email: string; expiresInSeconds: number; resendCooldownSeconds: number; emailDelivery: EmailDelivery }
export interface PasswordResetRequestResponse extends EmailOtpDispatchResponse { message: string }
export interface PasswordResetVerifyResponse { resetToken: string; expiresInSeconds: number }
export interface UpdateProfilePayload { name?: string }
export interface ChangePasswordPayload { currentPassword: string; newPassword: string }
export type LearnerDashboardCourseStatus = "in_progress" | "completed";
export interface LearnerDashboardSummary { enrolledCourseCount: number; completedCourseCount: number; averageProgressPercent: number; averageQuizScorePercent: number | null }
export interface LearnerDashboardBestQuizAttempt { quizId: string; attemptId: string; score: number; totalPoints: number; submittedAt: string; passed: boolean }
export interface LearnerDashboardContinueLearning { courseId: string; lessonId: string | null; href: string }
export interface LearnerDashboardCourse { enrollmentId: string; courseId: string; title: string; thumbnail: string | null; category: string; instructorName: string | null; progressPercent: number; status: LearnerDashboardCourseStatus; bestQuizScorePercent: number | null; bestQuizAttempt: LearnerDashboardBestQuizAttempt | null; continueLearning: LearnerDashboardContinueLearning }
export interface LearnerDashboardRecentActivity { id: string; courseId: string; lessonId: string | null; courseTitle: string; lessonTitle: string | null; eventType: string; occurredAt: string }
export type LearnerDashboardActivity = LearnerDashboardRecentActivity;
export interface LearnerDashboard { summary: LearnerDashboardSummary; courses: LearnerDashboardCourse[]; recentActivities: LearnerDashboardRecentActivity[] }
export type PublicCourseSortField = "createdAt" | "updatedAt" | "title" | "category" | "price";
export type PublicCourseSortOrder = "ASC" | "DESC";
export type PublicCourseLearningOrder = "sequential" | "free";
export interface PublicCourseInstructorSummary { id: string; name: string }
export interface PublicCourseLessonSummary { id: string; title: string; position: number }
export interface PublicCourse { id: string; title: string; description: string; category: string; thumbnail: string | null; learningOrder: PublicCourseLearningOrder; price: number; instructorId: string; instructor?: PublicCourseInstructorSummary; lessons?: PublicCourseLessonSummary[]; isEnrolled?: boolean; createdAt: string; updatedAt: string }
export interface PublicCourseListFilters { page?: number; limit?: number; q?: string; category?: string; sortBy?: PublicCourseSortField; sortOrder?: PublicCourseSortOrder }
export interface PublicCourseListResult { items: PublicCourse[]; total: number; page: number; limit: number; totalPages: number }
export interface EnrollmentCourseInstructor { id: string; name: string }
export interface EnrollmentCourse { id: string; title: string; description: string; category: string; thumbnail: string | null; price: number; instructorId: string; instructor?: EnrollmentCourseInstructor }
export interface Enrollment { id: string; learnerId: string; courseId: string; progress: string; completedAt: string | null; enrolledAt: string; course?: EnrollmentCourse }
export type CourseEnrollmentCompletionStatus = "not_started" | "in_progress" | "completed";
export interface CourseEnrollmentLearner { id: string; name: string; email: string }
export interface CourseEnrollmentQuizSummary { bestScore: number | null; latestAttemptAt: string | null; passed: boolean | null }
export interface CourseEnrollmentListItem { enrollmentId: string; learner: CourseEnrollmentLearner; enrolledAt: string; progress: string; completionStatus: CourseEnrollmentCompletionStatus; completedAt: string | null; lastActivityAt: string | null; quizSummary: CourseEnrollmentQuizSummary }
export interface CourseEnrollmentListFilters { page?: number; limit?: number; q?: string }
export interface CourseEnrollmentListResult { items: CourseEnrollmentListItem[]; total: number; page: number; limit: number; totalPages: number }
export interface CartCourseInstructor { id: string; name: string }
export interface CartCourse { id: string; title: string; category: string; thumbnail: string | null; price: number; instructor: CartCourseInstructor | null }
export interface CartItem { id: string; courseId: string; addedAt: string; course: CartCourse }
export interface CartSummary { totalItems: number; totalPrice: number }
export interface CartResponse { items: CartItem[]; total: number; page: number; limit: number; totalPages: number; summary: CartSummary }
export interface CartFilters { page?: number; limit?: number }
export interface LearningCourse { course: Pick<PublicCourse, "id" | "title" | "description" | "thumbnail" | "learningOrder">; enrollment: { id: string; progress: string; enrolledAt: string; completedAt: string | null }; lessons: { id: string; title: string; description: string; duration: number; position: number; isAccessible: boolean; isCompleted: boolean; blockedReason: string | null }[]; firstAccessibleLessonId: string | null }
export interface LearningLesson { id: string; courseId: string; title: string; description: string; duration: number; position: number; isAccessible: boolean; isCompleted: boolean; blockedReason: string | null; videoUrl: string | null; materialUrl: string | null }
export type WatchEventType = "opened" | "heartbeat" | "paused" | "completed";
export interface CreateWatchEventPayload { idempotencyKey: string; eventType: WatchEventType; positionSeconds: number; watchedSeconds: number; durationSeconds: number; clientCreatedAt: string }
export interface LessonProgress { lessonId: string; watchedSeconds: number; lastPositionSeconds: number; watchRatio: number; isWatchComplete: boolean; isLessonComplete: boolean; completedAt: string | null }
export interface WatchEventResponse { lessonProgress: LessonProgress; enrollment: LearningCourse["enrollment"] }
export interface AiSummary { lessonId: string; status: "pending" | "processing" | "ready" | "failed"; summaryText: string | null; updatedAt: string | null }
export interface AiChatCitation { lessonId: string | null; lessonTitle: string; excerpt: string }
export interface ChatMessage { id: string; role: "user" | "assistant"; content: string; inScope: boolean | null; similarity: number | null; citations: AiChatCitation[]; createdAt: string }
export interface ChatSession { sessionId: string; isAiAvailable: boolean; messages: ChatMessage[] }
export interface ChatSendResponse extends ChatSession { reply: ChatMessage }
export interface QuizQuestion { id: string; type: "single_choice" | "multiple_choice" | "essay"; content: string; options: string[]; isMultipleChoice: boolean; maxSelectableOptions: number | null; points: number; position: number }
export interface Quiz { id: string; lessonId: string; courseId: string; title: string; description: string; timeLimitMinutes: number | null; passScore: number; passScorePoints: number; totalPoints: number; questions: QuizQuestion[] }
export interface QuizAnswerPayload { questionId: string; selectedOptionIndexes?: number[]; text?: string }
export interface QuizAttemptStartResponse { attemptId: string; quiz: Quiz; startedAt: string; timeLimitMinutes: number | null }
export interface QuizAttemptResult { attemptId: string; quizId: string; startedAt: string; submittedAt: string | null; timeLimitMinutes: number | null; isLate: boolean; lateSeconds: number; totalScore: number; totalPoints: number; passScore: number; passScorePoints: number; passed: boolean; status: string; correctCount: number; wrongCount: number; pendingEssayCount: number }
export type PaymentStatus = "pending" | "paid" | "failed" | "cancelled" | "expired" | "refunded";
export interface PaymentOrderItem { id: string; courseId: string; courseTitle: string; instructorName: string | null; unitPrice: number }
export interface PaymentTransaction { id: string; learnerId: string; orderId: string; amount: number; currency: "VND"; status: PaymentStatus; paymentCode: string; provider: string; providerTransactionId: string | null; providerGateway: string | null; providerReferenceCode: string | null; expiresAt: string; paidAt: string | null; createdAt: string; orderItems: PaymentOrderItem[] }
export interface CheckoutResult extends PaymentTransaction { bankAccount: string; bankHolder: string; bankCode: string; qrImageUrl: string }
export interface LearnerPaymentTransactionFilters { status?: PaymentStatus; page?: number; limit?: number }
export interface LearnerPaymentTransactionItem { id: string; courseTitle: string; amount: number; status: PaymentStatus; createdAt: string; paidAt: string | null }
export interface LearnerPaymentTransactionListResult { items: LearnerPaymentTransactionItem[]; total: number; page: number; limit: number; totalPages: number }
export interface LearnerCertificate { id: string; courseId: string; learnerName: string; courseTitle: string; issuedAt: string; certificateUrl: string; verificationUrl: string }
export interface NotificationItem { id: string; type: "direct" | "queue"; title: string; message: string; metadata: Record<string, unknown>; actionUrl: string | null; sentAt: string; seen: boolean }
export interface NotificationListFilters { page?: number; limit?: number }
export interface NotificationListResult { items: NotificationItem[]; total: number; page: number; limit: number; totalPages: number }
export interface UnreadNotificationCountResult { count: number }
export interface MarkAllNotificationsSeenResult { modifiedCount: number }
export interface RegisterPushTokenPayload { expoPushToken: string; platform: "ios" | "android" }
