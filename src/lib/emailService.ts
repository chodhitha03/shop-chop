import emailjs from "@emailjs/browser";

/* ─── EmailJS Credentials ─────────────────────────── */
const SERVICE_ID = "service_hna8abc";
const PUBLIC_KEY = "thDcpU67UfvdC_KEk";

const TEMPLATES = {
  ORDER_CONFIRMATION: "template_zoam22i",
  RESET_PASSWORD: "template_qtyum9o",
};

/* ─── Initialize EmailJS ──────────────────────────── */
emailjs.init(PUBLIC_KEY);

/* ─── Helper: build order items HTML rows ─────────── */
const formatCurrency = (value: number) => `₹${Number(value || 0).toFixed(2)}`;

function buildOrderItemsHtml(
  items: { name: string; quantity: number; price: number }[]
): string {
  return items
    .map((item) => {
      const price = Number(item.price || 0);
      return `
    <tr style="border-bottom:1px solid #E8E0D4;">
      <td style="padding:12px 0;font-size:14px;color:#1E293B;"><strong>${item.name}</strong></td>
      <td style="padding:12px 0;font-size:14px;color:#64748B;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;font-size:14px;color:#1E293B;text-align:right;font-weight:600;">${formatCurrency(price)}</td>
    </tr>`;
    })
    .join("");
}

/* ═══════════════════════════════════════════════════
   1. Send Order Confirmation Email
   ═══════════════════════════════════════════════════ */
export async function sendOrderConfirmation(data: {
  customerName: string;
  toEmail: string;
  orderId: string;
  orderDate: string;
  paymentMethod: string;
  estimatedDelivery: string;
  deliveryAddress: string;
  items: { name: string; quantity: number; price: number }[];
  subtotal: number;
  deliveryFee: number | string;
  discount: number;
  total: number;
}) {
  const subtotalValue = Number(data.subtotal || 0);
  const discountValue = Number(data.discount || 0);
  const deliveryFeeValue = typeof data.deliveryFee === "string" ? null : Number(data.deliveryFee || 0);
  const computedTotal =
    Number.isFinite(Number(data.total))
      ? Number(data.total)
      : Math.max(subtotalValue + (deliveryFeeValue || 0) - discountValue, 0);

  const params = {
    to_email: data.toEmail,
    customer_name: data.customerName,
    order_id: data.orderId,
    order_date: data.orderDate,
    payment_method: data.paymentMethod,
    estimated_delivery: data.estimatedDelivery,
    delivery_address: data.deliveryAddress,
    order_items: buildOrderItemsHtml(data.items),
    subtotal: subtotalValue.toFixed(2),
    subtotal_amount: subtotalValue.toFixed(2),
    subtotal_display: formatCurrency(subtotalValue),
    delivery_fee:
      typeof data.deliveryFee === "string"
        ? data.deliveryFee
        : deliveryFeeValue && deliveryFeeValue > 0
        ? formatCurrency(deliveryFeeValue)
        : "FREE",
    delivery_fee_amount: deliveryFeeValue ? deliveryFeeValue.toFixed(2) : "0.00",
    delivery_fee_display: typeof data.deliveryFee === "string" ? data.deliveryFee : formatCurrency(deliveryFeeValue || 0),
    discount: discountValue.toFixed(2),
    discount_amount: discountValue.toFixed(2),
    discount_display: formatCurrency(discountValue),
    total: computedTotal.toFixed(2),
    total_amount: computedTotal.toFixed(2),
    total_display: formatCurrency(computedTotal),
    track_order_url: window.location.origin + "/",
  };

  return emailjs.send(SERVICE_ID, TEMPLATES.ORDER_CONFIRMATION, params);
}

/* ═══════════════════════════════════════════════════
   2. Send Reset Password Email
   ═══════════════════════════════════════════════════ */
export async function sendResetPasswordEmail(data: {
  name: string;
  email: string;
  resetLink: string;
}) {
  const params = {
    to_email: data.email,
    customer_name: data.name,
    name: data.name,
    email: data.email,
    reset_link: data.resetLink,
  };

  return emailjs.send(SERVICE_ID, TEMPLATES.RESET_PASSWORD, params);
}
