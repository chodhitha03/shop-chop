import emailjs from "@emailjs/browser";

/* ─── EmailJS Credentials ─────────────────────────── */
const SERVICE_ID = "service_hna8abc";
const PUBLIC_KEY = "thDcpU67UfvdC_KEk";

const TEMPLATES = {
  ORDER_CONFIRMATION: "template_zoam22i",
  RESET_PASSWORD: "template_lqhhh6d",
};

/* ─── Initialize EmailJS ──────────────────────────── */
emailjs.init(PUBLIC_KEY);

/* ─── Helper: build order items HTML rows ─────────── */
function buildOrderItemsHtml(
  items: { name: string; quantity: number; price: number }[]
): string {
  return items
    .map(
      (item) => `
    <tr style="border-bottom:1px solid #E8E0D4;">
      <td style="padding:12px 0;font-size:14px;color:#1E293B;"><strong>${item.name}</strong></td>
      <td style="padding:12px 0;font-size:14px;color:#64748B;text-align:center;">${item.quantity}</td>
      <td style="padding:12px 0;font-size:14px;color:#1E293B;text-align:right;font-weight:600;">₹${item.price}</td>
    </tr>`
    )
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
  const params = {
    to_email: data.toEmail,
    customer_name: data.customerName,
    order_id: data.orderId,
    order_date: data.orderDate,
    payment_method: data.paymentMethod,
    estimated_delivery: data.estimatedDelivery,
    delivery_address: data.deliveryAddress,
    order_items: buildOrderItemsHtml(data.items),
    subtotal: data.subtotal.toFixed(2),
    delivery_fee:
      typeof data.deliveryFee === "string"
        ? data.deliveryFee
        : data.deliveryFee > 0
        ? `₹${data.deliveryFee.toFixed(2)}`
        : "FREE",
    discount: data.discount.toFixed(2),
    total: data.total.toFixed(2),
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
