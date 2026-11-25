import { useLocalSearchParams } from "expo-router";
import { VerifyEmailForm } from "../components/auth/verify-email-form";

export default function VerifyEmail() {
  const { email, delivery } = useLocalSearchParams<{ email?: string; delivery?: string }>();
  const emailValue = Array.isArray(email) ? email[0] ?? "" : email ?? "";
  const deliveryValue = Array.isArray(delivery) ? delivery[0] ?? "" : delivery ?? "";
  return <VerifyEmailForm email={emailValue} delivery={deliveryValue} />;
}
