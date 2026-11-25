const LOCAL_MEDIA_HOSTS = new Set(["localhost", "127.0.0.1", "minio"]);

function parseUrl(value?: string | null): URL | null {
  if (!value) return null;
  try {
    return new URL(value);
  } catch {
    return null;
  }
}

function mediaOrigin(): URL | null {
  const configured = parseUrl(process.env.EXPO_PUBLIC_MINIO_PUBLIC_ENDPOINT?.trim());
  if (configured) return configured;
  const api = parseUrl(process.env.EXPO_PUBLIC_API_URL?.trim());
  if (!api || api.protocol !== "http:" || LOCAL_MEDIA_HOSTS.has(api.hostname.toLowerCase())) return null;
  const inferred = new URL(api.origin);
  inferred.port = "9000";
  return inferred;
}

export function resolveMediaUrl(value?: string | null): string | null {
  if (!value) return null;
  const parsed = parseUrl(value);
  if (!parsed || !LOCAL_MEDIA_HOSTS.has(parsed.hostname.toLowerCase())) return value;
  const target = mediaOrigin();
  if (!target) return value;
  parsed.protocol = target.protocol;
  parsed.host = target.host;
  return parsed.toString();
}
