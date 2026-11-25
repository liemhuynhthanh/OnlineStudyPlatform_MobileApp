import { Linking } from "react-native";

const fallbackPath = "/learner/dashboard";

export function getWebUrl() {
  const raw = process.env.EXPO_PUBLIC_WEB_URL?.trim();
  if (!raw) return null;
  try {
    const url = new URL(raw);
    if (url.protocol !== "http:" && url.protocol !== "https:") return null;
    return url.toString().replace(/\/$/, "");
  } catch {
    return null;
  }
}

export async function openWeb(path: string = fallbackPath) {
  const base = getWebUrl();
  if (!base) return false;
  const url = path ? `${base}/${path.replace(/^\//, "")}` : base;
  await Linking.openURL(url);
  return true;
}
