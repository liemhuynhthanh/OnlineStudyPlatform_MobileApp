import type { PaymentStatus } from "../../api/types";

export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  pending: "Đang chờ thanh toán",
  paid: "Đã thanh toán",
  failed: "Thanh toán thất bại",
  cancelled: "Đã hủy",
  expired: "Đã hết hạn",
  refunded: "Đã hoàn tiền",
};

export const PAYMENT_STATUS_SHORT_LABELS: Record<PaymentStatus, string> = {
  pending: "Đang chờ",
  paid: "Đã thanh toán",
  failed: "Thất bại",
  cancelled: "Đã hủy",
  expired: "Hết hạn",
  refunded: "Đã hoàn tiền",
};

export function formatPaymentStatus(status: PaymentStatus) {
  return PAYMENT_STATUS_LABELS[status];
}

export function paymentStatusTone(status: PaymentStatus): "indigo" | "green" | "orange" | "muted" {
  if (status === "paid") return "green";
  if (status === "pending") return "orange";
  if (status === "expired") return "orange";
  return "muted";
}
