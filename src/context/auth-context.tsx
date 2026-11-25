import { createContext, useContext, useEffect, useMemo, useState, type PropsWithChildren } from "react";
import { clearSession, getAccessToken, getRefreshToken, saveSession } from "../api/client";
import { getMe, mobileLogin, mobileLogout } from "../api/services";
import type { UserProfile } from "../api/types";

interface AuthContextValue { user: UserProfile | null; hydrated: boolean; signIn: (email: string, password: string) => Promise<void>; signOut: () => Promise<void>; setUser: (user: UserProfile | null) => void }
const AuthContext = createContext<AuthContextValue | null>(null);
const LEARNER_ROLE = "Learner" as const;

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { void (async () => { try { const accessToken = await getAccessToken(); const refreshToken = await getRefreshToken(); if (accessToken || refreshToken) { const profile = await getMe(); if (profile.role !== LEARNER_ROLE) { await clearSession(); return; } setUser(profile); } } catch { await clearSession(); } finally { setHydrated(true); } })(); }, []);
  const value = useMemo<AuthContextValue>(() => ({
    user,
    hydrated,
    setUser,
    async signIn(email, password) { const session = await mobileLogin(email, password); if (session.user.role !== LEARNER_ROLE) { await clearSession(); throw new Error("Ứng dụng mobile này chỉ dành cho học viên."); } await saveSession(session); setUser(session.user); },
    async signOut() { const refreshToken = await getRefreshToken(); try { await mobileLogout(refreshToken); } finally { await clearSession(); setUser(null); } },
  }), [hydrated, user]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() { const value = useContext(AuthContext); if (!value) throw new Error("useAuth must be used inside AuthProvider"); return value; }
