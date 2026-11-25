function decodePath(pathname: string) {
  try {
    return decodeURIComponent(pathname);
  } catch {
    return null;
  }
}

export function mapNotificationActionUrl(actionUrl: string | null | undefined): string | null {
  if (!actionUrl) return null;
  if (actionUrl.includes("\\") || actionUrl.startsWith("//") || /^[a-z][a-z\d+.-]*:/i.test(actionUrl)) return null;

  const pathname = actionUrl.split(/[?#]/, 1)[0] ?? "";
  if (!pathname.startsWith("/")) return null;

  const decoded = decodePath(pathname);
  if (!decoded || decoded.includes("\\") || decoded.includes("..")) return null;

  const normalized = decoded.replace(/\/+$/, "") || "/";
  const learn = normalized.match(/^\/learner\/courses\/([^/]+)\/learn$/);
  if (learn) return `/learn/${encodeURIComponent(learn[1])}`;

  const course = normalized.match(/^\/learner\/courses\/([^/]+)$/);
  if (course) return `/course/${encodeURIComponent(course[1])}`;

  const payment = normalized.match(/^\/learner\/payment\/checkout\/([^/]+)$/);
  if (payment) return `/payment/${encodeURIComponent(payment[1])}`;

  const routes: Record<string, string> = {
    "/learner": "/(tabs)",
    "/learner/my-learning": "/(tabs)/my-learning",
    "/learner/cart": "/cart",
    "/learner/checkout": "/checkout",
    "/learner/payments": "/payments",
    "/learner/certificates": "/certificates",
    "/learner/notifications": "/notifications",
    "/notifications": "/notifications",
  };
  return routes[normalized] ?? null;
}
