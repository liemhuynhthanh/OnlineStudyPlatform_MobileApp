import { isAxiosError } from "axios";
import { createAvatarFormData } from "../utils/avatar-upload";
import { api } from "./client";
import type { AiSummary, ApiSuccessResponse, AuthResponse, CartFilters, CartItem, CartResponse, ChangePasswordPayload, ChatSendResponse, ChatSession, CheckoutResult, CreateWatchEventPayload, CurrentUserResponse, EmailOtpDispatchResponse, Enrollment, LearnerCertificate, LearnerDashboard, LearnerPaymentTransactionFilters, LearnerPaymentTransactionListResult, LearningCourse, LearningLesson, MarkAllNotificationsSeenResult, NotificationListFilters, NotificationListResult, PasswordResetRequestResponse, PasswordResetVerifyResponse, PublicCourse, PublicCourseListFilters, PublicCourseListResult, Quiz, QuizAnswerPayload, QuizAttemptResult, QuizAttemptStartResponse, RegisterPushTokenPayload, RegisterUserPayload, RegisterUserResponse, UnreadNotificationCountResult, UpdateProfilePayload, UserProfile, WatchEventResponse } from "./types";

function buildQueryString(entries: [string, string | number | undefined][]): string {
  const params: string[] = [];
  for (const [key, value] of entries) {
    if (value === undefined) continue;
    const normalized = typeof value === "number" ? String(value) : value.trim();
    if (!normalized) continue;
    params.push(`${encodeURIComponent(key)}=${encodeURIComponent(normalized)}`);
  }
  return params.length > 0 ? `?${params.join("&")}` : "";
}

function buildLimitQuery(limit?: number): string {
  if (!limit) return "";
  return buildQueryString([["limit", Math.min(limit, 20)]]);
}

export async function mobileLogin(email: string, password: string) { try { const { data } = await api.post<ApiSuccessResponse<AuthResponse>>("/auth/mobile/login", { email, password }); return data.data; } catch (error) { if (!isAxiosError(error) || ![404, 405].includes(error.response?.status ?? 0)) throw error; const { data } = await api.post<ApiSuccessResponse<AuthResponse>>("/auth/login", { email, password }); return data.data; } }
export async function mobileLogout(refreshToken: string | null) { if (refreshToken) await api.post("/auth/mobile/logout", { refreshToken }); else await api.post("/auth/logout"); }
export async function getMe() { const { data } = await api.get<ApiSuccessResponse<UserProfile>>("/users/me"); return data.data; }
export async function registerUser(payload: RegisterUserPayload) { const { data } = await api.post<ApiSuccessResponse<RegisterUserResponse>>("/auth/register", payload); return data.data; }
export async function verifyEmail(email: string, otp: string) { const { data } = await api.post<ApiSuccessResponse<CurrentUserResponse>>("/auth/email/verify", { email, otp }); return data.data; }
export async function resendEmailOtp(email: string) { const { data } = await api.post<ApiSuccessResponse<EmailOtpDispatchResponse>>("/auth/email/resend-otp", { email }); return data.data; }
export async function requestPasswordReset(email: string) { const { data } = await api.post<ApiSuccessResponse<PasswordResetRequestResponse>>("/auth/password-reset/request-otp", { email }); return data.data; }
export async function verifyPasswordReset(email: string, otp: string) { const { data } = await api.post<ApiSuccessResponse<PasswordResetVerifyResponse>>("/auth/password-reset/verify-otp", { email, otp }); return data.data; }
export async function resetPassword(resetToken: string, newPassword: string) { await api.post("/auth/password-reset/reset", { resetToken, newPassword }); }
export async function updateMe(payload: UpdateProfilePayload) { const { data } = await api.patch<ApiSuccessResponse<UserProfile>>("/users/me", payload); return data.data; }
export async function changePassword(payload: ChangePasswordPayload) { await api.patch("/users/me/password", payload); }
export async function uploadAvatar(uri: string | Blob, fileName = "avatar.jpg") { const formData = createAvatarFormData(uri, fileName); const { data } = await api.post<ApiSuccessResponse<UserProfile>>("/users/me/avatar", formData); return data.data; }
export async function listPublicCourses(filters: PublicCourseListFilters = {}) { const query = buildQueryString([["page", filters.page ? filters.page : undefined], ["limit", filters.limit ? filters.limit : undefined], ["q", filters.q], ["category", filters.category], ["sortBy", filters.sortBy], ["sortOrder", filters.sortOrder]]); const { data } = await api.get<ApiSuccessResponse<PublicCourseListResult>>(`/courses/public${query}`); return data.data; }
export async function getPublicCourse(courseId: string) { const { data } = await api.get<ApiSuccessResponse<PublicCourse>>(`/courses/public/${encodeURIComponent(courseId)}`); return data.data; }
export async function listSuggestedCourses(limit?: number) { const { data } = await api.get<ApiSuccessResponse<PublicCourse[]>>(`/courses/public/suggestion${buildLimitQuery(limit)}`); return data.data; }
export async function listLatestCourses(limit?: number) { const { data } = await api.get<ApiSuccessResponse<PublicCourse[]>>(`/courses/public/latest${buildLimitQuery(limit)}`); return data.data; }
export async function listRecommendations(limit?: number) { const { data } = await api.get<ApiSuccessResponse<PublicCourse[]>>(`/recommendations/me${buildLimitQuery(limit)}`); return data.data; }
export async function getDashboard() { const { data } = await api.get<ApiSuccessResponse<LearnerDashboard>>("/learner/dashboard"); return data.data; }
export async function listMyEnrollments() { const { data } = await api.get<ApiSuccessResponse<Enrollment[]>>("/enrollments/me"); return data.data; }
export async function enrollCourse(courseId: string) { const { data } = await api.post<ApiSuccessResponse<Enrollment>>(`/courses/${encodeURIComponent(courseId)}/enrollments`); return data.data; }
export async function addToCart(courseId: string) { const { data } = await api.post<ApiSuccessResponse<CartItem>>("/cart/items", { courseId }); return data.data; }
export async function getCart(filters: CartFilters = {}) { const query = buildQueryString([["page", filters.page], ["limit", filters.limit]]); const { data } = await api.get<ApiSuccessResponse<CartResponse>>(`/cart${query}`); return data.data; }
export async function removeFromCart(courseId: string) { await api.delete(`/cart/items/${encodeURIComponent(courseId)}`); }
export async function checkoutCart() { const { data } = await api.post<ApiSuccessResponse<CheckoutResult>>("/cart/checkout"); return data.data; }
export async function getPaymentTransaction(transactionId: string) { const { data } = await api.get<ApiSuccessResponse<CheckoutResult>>(`/payments/transactions/${encodeURIComponent(transactionId)}`); return data.data; }
export async function cancelPaymentTransaction(transactionId: string) { const { data } = await api.post<ApiSuccessResponse<CheckoutResult>>(`/payments/transactions/${encodeURIComponent(transactionId)}/cancel`); return data.data; }
export async function listMyPaymentTransactions(filters: LearnerPaymentTransactionFilters = {}) { const query = buildQueryString([["status", filters.status], ["page", filters.page], ["limit", filters.limit]]); const { data } = await api.get<ApiSuccessResponse<LearnerPaymentTransactionListResult>>(`/payments/transactions${query}`); return data.data; }
export async function listMyCertificates() { const { data } = await api.get<ApiSuccessResponse<LearnerCertificate[]>>("/learner/certificates"); return data.data; }
export async function downloadCertificate(certificateId: string): Promise<Blob | Uint8Array> { const { data } = await api.get<ArrayBuffer>(`/learner/certificates/${encodeURIComponent(certificateId)}/download`, { responseType: "arraybuffer" }); return typeof document !== "undefined" ? new Blob([data], { type: "application/pdf" }) : new Uint8Array(data); }
export async function listNotifications(filters: NotificationListFilters = {}) { const query = buildQueryString([["page", filters.page], ["limit", filters.limit]]); const { data } = await api.get<ApiSuccessResponse<NotificationListResult>>(`/notifications/me${query}`); return data.data; }
export async function getUnreadNotificationCount() { const { data } = await api.get<ApiSuccessResponse<UnreadNotificationCountResult>>("/notifications/me/unread-count"); return data.data; }
export async function markNotificationSeen(notificationId: string) { await api.patch(`/notifications/${encodeURIComponent(notificationId)}/seen`); }
export async function markAllNotificationsSeen() { const { data } = await api.patch<ApiSuccessResponse<MarkAllNotificationsSeenResult>>("/notifications/me/seen"); return data.data; }
export async function registerPushToken(payload: RegisterPushTokenPayload) { await api.post("/notifications/mobile/push-tokens", payload); }
export async function getLearningCourse(courseId: string) { const { data } = await api.get<ApiSuccessResponse<LearningCourse>>(`/learning/courses/${encodeURIComponent(courseId)}`); return data.data; }
export async function getLearningLesson(courseId: string, lessonId: string) { const { data } = await api.get<ApiSuccessResponse<LearningLesson>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}`); return data.data; }
export async function sendWatchEvent(courseId: string, lessonId: string, payload: CreateWatchEventPayload) { const { data } = await api.post<ApiSuccessResponse<WatchEventResponse>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/watch-events`, payload); return data.data; }
export async function completeLesson(courseId: string, lessonId: string) { const { data } = await api.post<ApiSuccessResponse<WatchEventResponse>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/complete`); return data.data; }
export async function getLessonSummary(courseId: string, lessonId: string) { const { data } = await api.get<ApiSuccessResponse<AiSummary>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/summary`); return data.data; }
export async function getChat(courseId: string) { const { data } = await api.get<ApiSuccessResponse<ChatSession>>(`/learning/courses/${encodeURIComponent(courseId)}/chat`); return data.data; }
export async function sendChat(courseId: string, question: string) { const { data } = await api.post<ApiSuccessResponse<ChatSendResponse>>(`/learning/courses/${encodeURIComponent(courseId)}/chat`, { question }); return data.data; }
export async function getQuiz(courseId: string, lessonId: string) { const { data } = await api.get<ApiSuccessResponse<{ quiz: Quiz | null }>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/quiz`); return data.data; }
export async function listQuizAttempts(courseId: string, lessonId: string, quizId: string) { const { data } = await api.get<ApiSuccessResponse<QuizAttemptResult[]>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/quiz/${encodeURIComponent(quizId)}/attempts`); return data.data; }
export async function startQuiz(courseId: string, lessonId: string, quizId: string) { const { data } = await api.post<ApiSuccessResponse<QuizAttemptStartResponse>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/quiz/${encodeURIComponent(quizId)}/attempts`); return data.data; }
export async function submitQuiz(courseId: string, lessonId: string, quizId: string, attemptId: string, answers: QuizAnswerPayload[]) { const { data } = await api.post<ApiSuccessResponse<QuizAttemptResult>>(`/learning/courses/${encodeURIComponent(courseId)}/lessons/${encodeURIComponent(lessonId)}/quiz/${encodeURIComponent(quizId)}/attempts/${encodeURIComponent(attemptId)}/submit`, { answers }); return data.data; }
