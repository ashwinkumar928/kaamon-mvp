export const MIN_PAYMENT = 100;
export const MAX_PAYMENT = 50000;
export const PAYMENT_HELP = "Payment must be between ₹100 and ₹50,000.";

export function getPaymentError(payment) {
  if ((typeof payment !== "string" && typeof payment !== "number") ||
      String(payment).trim() === "") return "Please enter a payment amount.";

  const paymentNumber = Number(payment);
  if (!Number.isFinite(paymentNumber)) return "Please enter a valid payment amount.";
  if (paymentNumber < MIN_PAYMENT) return "Minimum payment is ₹100.";
  if (paymentNumber > MAX_PAYMENT) return "Maximum payment is ₹50,000.";
  if (!Number.isInteger(paymentNumber)) return "Payment must be a whole rupee amount.";
  return "";
}
