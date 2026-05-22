/**
 * Preview email templates in your browser.
 *
 * Run:   node server/utils/previewEmails.js
 * Open:  http://localhost:3333/order   – order confirmation / invoice
 *        http://localhost:3333/reset   – reset password
 */

import http from "node:http";
import { orderConfirmationEmail, resetPasswordEmail } from "./emailTemplates.js";

/* ── Sample data ─────────────────────────────────── */

const orderData = {
  customerName: "Chodhitha",
  orderId: "SC-20260521-4781",
  orderDate: "May 21, 2026",
  estimatedDelivery: "May 23, 2026 — between 5:00 PM – 7:00 PM",
  deliveryAddress: "42, Park Avenue, Hyderabad, Telangana 500032",
  paymentMethod: "UPI — Google Pay",
  items: [
    { name: "All-purpose flour", quantity: 2, price: 290 },
    { name: "Baking powder",     quantity: 1, price: 100 },
    { name: "Sugar",             quantity: 1, price: 165 },
    { name: "Milk",              quantity: 2, price: 330 },
    { name: "Eggs (6 pcs)",      quantity: 1, price: 250 },
    { name: "Butter (200g)",     quantity: 1, price: 205 },
  ],
  subtotal: 1340,
  deliveryFee: 0,
  discount: 100,
  total: 1240,
};

const resetData = {
  customerName: "Chodhitha",
  resetLink: "http://localhost:8080/reset-password/abc123def456tokenexample",
  expiryMinutes: 10,
};

/* ── Server ──────────────────────────────────────── */

const server = http.createServer((req, res) => {
  res.setHeader("Content-Type", "text/html; charset=utf-8");

  if (req.url === "/order") {
    res.end(orderConfirmationEmail(orderData));
  } else if (req.url === "/reset") {
    res.end(resetPasswordEmail(resetData));
  } else {
    res.end(`
      <body style="font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;margin:0;background:#faf7f2;">
        <div style="text-align:center;">
          <h1>📧 Email Template Previews</h1>
          <p><a href="/order" style="font-size:18px;">🧾 Order Confirmation / Invoice</a></p>
          <p><a href="/reset" style="font-size:18px;">🔐 Reset Password</a></p>
        </div>
      </body>
    `);
  }
});

server.listen(3333, () => {
  console.log("\n📧 Email template preview server running:");
  console.log("   http://localhost:3333         — index");
  console.log("   http://localhost:3333/order   — order confirmation / invoice");
  console.log("   http://localhost:3333/reset   — reset password\n");
});
