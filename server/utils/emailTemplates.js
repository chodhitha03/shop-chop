/**
 * Shop & Chop — Email Templates
 *
 * Usage:
 *   import { orderConfirmationEmail, resetPasswordEmail } from '../utils/emailTemplates.js';
 *
 *   const html = orderConfirmationEmail({ ...data });
 *   // send `html` via your email provider (Nodemailer, SendGrid, Resend, etc.)
 */

/* ─── shared helpers ──────────────────────────────── */
const brandColor = "#C2491D";
const bgColor = "#FAF7F2";
const textColor = "#1E293B";
const mutedColor = "#64748B";
const borderColor = "#E8E0D4";

const currency = (n) => `₹${Number(n).toFixed(2)}`;

const baseLayout = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Shop &amp; Chop</title>
</head>
<body style="margin:0;padding:0;background-color:${bgColor};font-family:'Segoe UI',Roboto,'Helvetica Neue',Arial,sans-serif;color:${textColor};-webkit-text-size-adjust:100%;-ms-text-size-adjust:100%;">
  <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${bgColor};">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table role="presentation" cellpadding="0" cellspacing="0" width="600" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">

          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,${brandColor} 0%,#2E6B6A 100%);padding:32px 40px;text-align:center;">
              <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 auto;">
                <tr>
                  <td style="background-color:rgba(255,255,255,0.15);border-radius:12px;padding:10px 12px;vertical-align:middle;">
                    <span style="font-size:22px;">🍳</span>
                  </td>
                  <td style="padding-left:12px;vertical-align:middle;">
                    <span style="font-size:22px;font-weight:700;color:#FFFFFF;letter-spacing:0.5px;">Shop &amp; Chop</span>
                    <br />
                    <span style="font-size:11px;color:rgba(255,255,255,0.7);text-transform:uppercase;letter-spacing:2.5px;">Culinary Studio</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="padding:24px 40px;border-top:1px solid ${borderColor};text-align:center;">
              <p style="margin:0 0 8px;font-size:12px;color:${mutedColor};">
                &copy; ${new Date().getFullYear()} Shop &amp; Chop — Culinary Studio. All rights reserved.
              </p>
              <p style="margin:0;font-size:12px;color:${mutedColor};">
                <a href="#" style="color:${brandColor};text-decoration:none;">Unsubscribe</a>
                &nbsp;&middot;&nbsp;
                <a href="#" style="color:${brandColor};text-decoration:none;">Privacy Policy</a>
                &nbsp;&middot;&nbsp;
                <a href="#" style="color:${brandColor};text-decoration:none;">Contact Us</a>
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;


/* ════════════════════════════════════════════════════
   1. ORDER CONFIRMATION / INVOICE
   ════════════════════════════════════════════════════ */

/**
 * @param {Object} data
 * @param {string}   data.customerName
 * @param {string}   data.orderId
 * @param {string}   data.orderDate        – ISO string or readable date
 * @param {string}   data.estimatedDelivery – e.g. "May 23, 2026, 6:00 PM"
 * @param {string}   [data.deliveryAddress]
 * @param {Array<{name:string, quantity:number|string, price:number}>} data.items
 * @param {number}   data.subtotal
 * @param {number}   [data.deliveryFee]
 * @param {number}   [data.discount]
 * @param {number}   data.total
 * @param {string}   [data.paymentMethod]
 */
export function orderConfirmationEmail(data) {
  const {
    customerName,
    orderId,
    orderDate,
    estimatedDelivery,
    deliveryAddress = "",
    items = [],
    subtotal,
    deliveryFee = 0,
    discount = 0,
    total,
    paymentMethod = "Online Payment",
  } = data;

  const itemRows = items
    .map(
      (item, i) => `
      <tr style="border-bottom:1px solid ${borderColor};">
        <td style="padding:12px 0;font-size:14px;color:${textColor};">
          <strong>${item.name}</strong>
        </td>
        <td style="padding:12px 0;font-size:14px;color:${mutedColor};text-align:center;">
          ${item.quantity}
        </td>
        <td style="padding:12px 0;font-size:14px;color:${textColor};text-align:right;font-weight:600;">
          ${currency(item.price)}
        </td>
      </tr>`
    )
    .join("");

  const content = `
    <!-- Success icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background-color:#ECFDF5;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;">
        <span style="font-size:32px;">✅</span>
      </div>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:${textColor};">
      Order Confirmed!
    </h1>
    <p style="margin:0 0 32px;font-size:15px;color:${mutedColor};text-align:center;">
      Hi ${customerName}, your order has been received and is being prepared.
    </p>

    <!-- Order meta -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${bgColor};border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${mutedColor};">Order ID</td>
              <td style="padding:4px 0;font-size:13px;color:${textColor};text-align:right;font-weight:600;">#${orderId}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${mutedColor};">Order Date</td>
              <td style="padding:4px 0;font-size:13px;color:${textColor};text-align:right;">${orderDate}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:${mutedColor};">Payment</td>
              <td style="padding:4px 0;font-size:13px;color:${textColor};text-align:right;">${paymentMethod}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Delivery info -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background:linear-gradient(135deg,${brandColor}10,${brandColor}05);border:1px solid ${brandColor}30;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:top;width:40px;">
                <span style="font-size:24px;">🚚</span>
              </td>
              <td style="vertical-align:top;">
                <p style="margin:0 0 4px;font-size:14px;font-weight:700;color:${textColor};">Estimated Delivery</p>
                <p style="margin:0 0 2px;font-size:16px;font-weight:700;color:${brandColor};">${estimatedDelivery}</p>
                ${deliveryAddress ? `<p style="margin:8px 0 0;font-size:13px;color:${mutedColor};">📍 ${deliveryAddress}</p>` : ""}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Item list -->
    <h2 style="margin:0 0 16px;font-size:16px;font-weight:700;color:${textColor};">Order Items</h2>
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="margin-bottom:24px;">
      <tr style="border-bottom:2px solid ${borderColor};">
        <td style="padding:8px 0;font-size:12px;color:${mutedColor};text-transform:uppercase;letter-spacing:1px;">Item</td>
        <td style="padding:8px 0;font-size:12px;color:${mutedColor};text-transform:uppercase;letter-spacing:1px;text-align:center;">Qty</td>
        <td style="padding:8px 0;font-size:12px;color:${mutedColor};text-transform:uppercase;letter-spacing:1px;text-align:right;">Price</td>
      </tr>
      ${itemRows}
    </table>

    <!-- Totals -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${bgColor};border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="padding:4px 0;font-size:14px;color:${mutedColor};">Subtotal</td>
              <td style="padding:4px 0;font-size:14px;color:${textColor};text-align:right;">${currency(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:14px;color:${mutedColor};">Delivery Fee</td>
              <td style="padding:4px 0;font-size:14px;color:${textColor};text-align:right;">${deliveryFee > 0 ? currency(deliveryFee) : "FREE"}</td>
            </tr>
            ${
              discount > 0
                ? `<tr>
              <td style="padding:4px 0;font-size:14px;color:#16A34A;">Discount</td>
              <td style="padding:4px 0;font-size:14px;color:#16A34A;text-align:right;">-${currency(discount)}</td>
            </tr>`
                : ""
            }
            <tr>
              <td colspan="2" style="padding:8px 0 0;"><hr style="border:none;border-top:1px solid ${borderColor};margin:0;" /></td>
            </tr>
            <tr>
              <td style="padding:8px 0 0;font-size:18px;font-weight:700;color:${textColor};">Total</td>
              <td style="padding:8px 0 0;font-size:18px;font-weight:700;color:${brandColor};text-align:right;">${currency(total)}</td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- CTA -->
    <div style="text-align:center;margin-bottom:16px;">
      <a href="#" style="display:inline-block;background-color:${brandColor};color:#FFFFFF;text-decoration:none;font-size:14px;font-weight:600;padding:14px 32px;border-radius:10px;">
        Track Your Order
      </a>
    </div>

    <p style="margin:0;font-size:13px;color:${mutedColor};text-align:center;">
      If you have any questions, reply to this email or contact our support team.
    </p>
  `;

  return baseLayout(content);
}


/* ════════════════════════════════════════════════════
   2. RESET PASSWORD
   ════════════════════════════════════════════════════ */

/**
 * @param {Object} data
 * @param {string} data.customerName
 * @param {string} data.resetLink   – full URL with token
 * @param {number} [data.expiryMinutes] – default 10
 */
export function resetPasswordEmail(data) {
  const {
    customerName,
    resetLink,
    expiryMinutes = 10,
  } = data;

  const content = `
    <!-- Lock icon -->
    <div style="text-align:center;margin-bottom:24px;">
      <div style="display:inline-block;background-color:#FEF3C7;border-radius:50%;width:64px;height:64px;line-height:64px;text-align:center;">
        <span style="font-size:32px;">🔐</span>
      </div>
    </div>

    <h1 style="margin:0 0 8px;font-size:24px;font-weight:700;text-align:center;color:${textColor};">
      Reset Your Password
    </h1>
    <p style="margin:0 0 24px;font-size:15px;color:${mutedColor};text-align:center;line-height:1.6;">
      Hi ${customerName}, we received a request to reset your password.<br />
      Click the button below to create a new one.
    </p>

    <!-- CTA Button -->
    <div style="text-align:center;margin-bottom:24px;">
      <a href="${resetLink}" style="display:inline-block;background-color:${brandColor};color:#FFFFFF;text-decoration:none;font-size:15px;font-weight:600;padding:16px 40px;border-radius:10px;letter-spacing:0.3px;">
        Reset Password
      </a>
    </div>

    <!-- Expiry warning -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:#FEF3C7;border-radius:12px;margin-bottom:24px;">
      <tr>
        <td style="padding:16px 20px;">
          <table role="presentation" cellpadding="0" cellspacing="0" width="100%">
            <tr>
              <td style="vertical-align:middle;width:32px;">
                <span style="font-size:20px;">⏰</span>
              </td>
              <td style="vertical-align:middle;">
                <p style="margin:0;font-size:13px;color:#92400E;line-height:1.5;">
                  <strong>This link expires in ${expiryMinutes} minutes.</strong><br />
                  If you didn't request this reset, you can safely ignore this email.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Fallback link -->
    <p style="margin:0 0 8px;font-size:13px;color:${mutedColor};text-align:center;">
      If the button doesn't work, copy and paste this link into your browser:
    </p>
    <p style="margin:0 0 24px;font-size:12px;color:${brandColor};text-align:center;word-break:break-all;">
      <a href="${resetLink}" style="color:${brandColor};">${resetLink}</a>
    </p>

    <!-- Security tips -->
    <table role="presentation" cellpadding="0" cellspacing="0" width="100%" style="background-color:${bgColor};border-radius:12px;">
      <tr>
        <td style="padding:16px 20px;">
          <p style="margin:0 0 8px;font-size:13px;font-weight:700;color:${textColor};">🛡️ Security Tips</p>
          <ul style="margin:0;padding:0 0 0 18px;font-size:13px;color:${mutedColor};line-height:1.8;">
            <li>Never share your password with anyone</li>
            <li>Use a strong password with at least 8 characters</li>
            <li>Mix uppercase, lowercase, numbers and symbols</li>
          </ul>
        </td>
      </tr>
    </table>
  `;

  return baseLayout(content);
}
