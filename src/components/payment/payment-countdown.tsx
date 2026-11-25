import { useEffect, useRef, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors, spacing } from "../../theme";

function secondsUntil(expiresAt: string) {
  const remaining = Math.ceil((new Date(expiresAt).getTime() - Date.now()) / 1000);
  return Number.isFinite(remaining) ? Math.max(0, remaining) : 0;
}

function formatCountdown(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

export function PaymentCountdown({ expiresAt, onExpire }: { expiresAt: string; onExpire: () => void }) {
  const [remaining, setRemaining] = useState(() => secondsUntil(expiresAt));
  const expiredRef = useRef(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = secondsUntil(expiresAt);
      setRemaining(next);
      if (next === 0 && !expiredRef.current) {
        expiredRef.current = true;
        onExpire();
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [expiresAt, onExpire]);

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Thời gian còn lại</Text>
      <Text style={[styles.value, remaining === 0 && styles.valueExpired]}>{formatCountdown(remaining)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  label: { color: colors.mutedForeground, fontSize: 13 },
  value: { color: colors.ink, fontSize: 28, fontWeight: "800", letterSpacing: 1 },
  valueExpired: { color: colors.danger },
});
