import axios, { create, isAxiosError, type AxiosError, type InternalAxiosRequestConfig } from "axios";
import * as SecureStore from "expo-secure-store";
import type { ApiSuccessResponse, AuthResponse } from "./types";

const baseURL = process.env.EXPO_PUBLIC_API_URL ?? "https://api.d4cclothing.online";
const accessKey = "learner_access_token";
const refreshKey = "learner_refresh_token";
export const api = create({ baseURL, timeout: 60_000, withCredentials: true });
export const getAccessToken = () => SecureStore.getItemAsync(accessKey);
export const getRefreshToken = () => SecureStore.getItemAsync(refreshKey);
export async function saveSession(session: AuthResponse) { await SecureStore.setItemAsync(accessKey, session.accessToken); if (session.refreshToken) await SecureStore.setItemAsync(refreshKey, session.refreshToken); else await SecureStore.deleteItemAsync(refreshKey); }
export async function clearSession() { await Promise.all([SecureStore.deleteItemAsync(accessKey), SecureStore.deleteItemAsync(refreshKey)]); }
async function refreshSession() { const refreshToken = await getRefreshToken(); const response = refreshToken ? await axios.post<ApiSuccessResponse<AuthResponse>>(`${baseURL}/auth/mobile/refresh`, { refreshToken }, { withCredentials: true }) : await axios.post<ApiSuccessResponse<AuthResponse>>(`${baseURL}/auth/refresh`, undefined, { withCredentials: true }); await saveSession(response.data.data); return response.data.data; }
let refreshPromise: Promise<AuthResponse> | null = null;
api.interceptors.request.use(async (config) => { const token = await getAccessToken(); if (token) config.headers.Authorization = `Bearer ${token}`; return config; });
api.interceptors.response.use((response) => response, async (error: AxiosError) => {
  const original = error.config as InternalAxiosRequestConfig & { _retry?: boolean };
  const url = original?.url ?? "";
  if (error.response?.status !== 401 || original?._retry || url.includes("/auth/mobile/")) return Promise.reject(error);
  original._retry = true;
  try { refreshPromise ??= refreshSession().finally(() => { refreshPromise = null; }); const session = await refreshPromise; original.headers.Authorization = `Bearer ${session.accessToken}`; return api(original); }
  catch (refreshError) { await clearSession(); return Promise.reject(refreshError); }
});
export function getApiErrorMessage(error: unknown) { if (isAxiosError(error)) { const data = error.response?.data as { error?: { message?: string } } | undefined; return data?.error?.message ?? "Không thể kết nối đến máy chủ."; } return error instanceof Error ? error.message : "Đã xảy ra lỗi."; }
