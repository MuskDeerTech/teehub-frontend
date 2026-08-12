/**
 * Order emails: the customer's receipt and the staff "new order" alert.
 *
 * Both are sent from the same two moments, never on order creation alone — an
 * online order row exists before the customer has paid anything, so sending on
 * create would mail a receipt for every abandoned checkout. The callers decide:
 * COD sends on create (the order is real the moment it is written), online
 * sends on the pending -> paid transition. See `reconcileHdfcOrder`.
 *
 * Nothing in here is allowed to throw. An order that has already been paid for
 * must never fail because Resend is slow or down, so every send is caught and
 * logged rather than propagated.
 */
import type { Payload } from "payload";
import type { Order } from "../../../payload-types";

function siteUrl() {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.PAYLOAD_PUBLIC_SERVER_URL ||
    "https://www.teehubshop.com"
  ).replace(/\/+$/, "");
}

/**
 * Order fields carry customer-supplied text — `customName` is whatever they
 * asked to have printed on the jersey. It lands in an HTML email read by staff,
 * so it is escaped rather than interpolated raw.
 */
function escapeHtml(value: unknown) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function formatInr(value?: number | null) {
  const amount = Number(value ?? 0);
  if (!Number.isFinite(amount)) return "₹0";
  const rounded = Math.round(amount * 100) / 100;
  return `₹${(Number.isInteger(rounded) ? rounded : Number(rounded.toFixed(2))).toLocaleString("en-IN")}`;
}

const PAYMENT_LABELS: Record<string, string> = {
  cod: "Cash on Delivery",
  online: "Online payment",
  wallet: "Wallet",
  netbanking: "Net banking",
  card: "Card",
};

function paymentLabel(order: Order) {
  const method = order.payment?.method ?? "online";
  const label = PAYMENT_LABELS[method] ?? "Online payment";
  if (method === "cod") {
    return `${label} — ${formatInr(order.totalPrice)} due on delivery`;
  }
  return order.payment?.status === "paid" ? `${label} — paid` : label;
}

function deliveryAddress(order: Order) {
  return [
    order.fullName,
    order.address,
    [order.city, order.state].filter(Boolean).join(", "),
    order.pincode,
    order.phone,
  ]
    .filter((line) => Boolean(String(line ?? "").trim()))
    .map((line) => escapeHtml(line))
    .join("<br />");
}

/** Shared line-item table, used by both emails so they can never disagree. */
function itemRows(order: Order) {
  return (order.items ?? [])
    .map((item) => {
      const meta = [
        item.size ? `Size ${escapeHtml(item.size)}` : "",
        item.color ? escapeHtml(item.color) : "",
        item.customName ? `Printed: ${escapeHtml(item.customName)}` : "",
      ]
        .filter(Boolean)
        .join(" &middot; ");

      return `
        <tr>
          <td style="padding:12px 0;border-bottom:1px solid #eeeeee;">
            <p style="margin:0;font-size:14px;font-weight:700;color:#111111;">${escapeHtml(item.name)}</p>
            ${meta ? `<p style="margin:4px 0 0;font-size:12px;color:#777777;">${meta}</p>` : ""}
            <p style="margin:4px 0 0;font-size:12px;color:#777777;">Qty ${escapeHtml(item.quantity)}</p>
          </td>
          <td align="right" style="padding:12px 0;border-bottom:1px solid #eeeeee;font-size:14px;font-weight:700;color:#111111;white-space:nowrap;">
            ${formatInr(item.price * item.quantity)}
          </td>
        </tr>`;
    })
    .join("");
}

function totalsRows(order: Order) {
  const rows: string[] = [];
  const discount = Number(order.discountTotal ?? 0);
  if (discount > 0) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:#777777;">Discount</td><td align="right" style="padding:4px 0;font-size:13px;color:#0a8a3c;">− ${formatInr(discount)}</td></tr>`,
    );
  }
  if (order.giftWrap) {
    rows.push(
      `<tr><td style="padding:4px 0;font-size:13px;color:#777777;">Gift wrap</td><td align="right" style="padding:4px 0;font-size:13px;color:#111111;">Added</td></tr>`,
    );
  }
  rows.push(
    `<tr><td style="padding:4px 0;font-size:13px;color:#777777;">Shipping</td><td align="right" style="padding:4px 0;font-size:13px;color:#0a8a3c;">Free</td></tr>`,
  );
  return rows.join("");
}

function shell({
  eyebrow,
  heading,
  intro,
  body,
  cta,
}: {
  eyebrow: string;
  heading: string;
  intro: string;
  body: string;
  cta?: { label: string; href: string };
}) {
  const logoUrl =
    process.env.EMAIL_LOGO_URL?.trim() || `${siteUrl()}/images/teehub-logo.png`;

  return `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0;background:#f4f4f4;padding:28px 12px;font-family:Arial,Helvetica,sans-serif;color:#111111;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;background:#ffffff;border-radius:18px;overflow:hidden;border:1px solid #eeeeee;">
            <tr>
              <td align="center" style="padding:28px 28px 18px;background:#ffffff;">
                <img src="${logoUrl}" width="150" alt="TeeHub" style="display:block;width:150px;max-width:70%;height:auto;border:0;" />
              </td>
            </tr>
            <tr>
              <td style="padding:0 32px 30px;">
                <p style="margin:0 0 8px;font-size:12px;font-weight:700;letter-spacing:1.6px;text-transform:uppercase;color:#f26522;text-align:center;">${escapeHtml(eyebrow)}</p>
                <h1 style="margin:0;color:#111111;font-size:26px;line-height:1.25;font-weight:800;text-align:center;">${escapeHtml(heading)}</h1>
                <p style="margin:14px 0 22px;color:#666666;font-size:15px;line-height:1.6;text-align:center;">${intro}</p>
                ${body}
                ${
                  cta
                    ? `<table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:26px 0 0;">
                         <tr>
                           <td align="center">
                             <a href="${cta.href}" style="display:inline-block;background:#f26522;color:#ffffff;font-size:14px;font-weight:700;text-decoration:none;padding:13px 30px;border-radius:999px;">${escapeHtml(cta.label)}</a>
                           </td>
                         </tr>
                       </table>`
                    : ""
                }
              </td>
            </tr>
            <tr>
              <td style="padding:18px 28px;background:#111111;text-align:center;">
                <p style="margin:0;color:#ffffff;font-size:13px;font-weight:700;">TeeHub</p>
                <p style="margin:6px 0 0;color:#bdbdbd;font-size:12px;line-height:1.5;">Premium sports jerseys, hoodies and polos.</p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function orderConfirmationHtml(order: Order) {
  const body = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 6px;">
      <tr>
        <td style="background:#fff4ee;border:1px solid #ffd9c8;border-radius:14px;padding:14px 18px;">
          <p style="margin:0;font-size:12px;color:#a15a37;letter-spacing:1px;text-transform:uppercase;font-weight:700;">Order number</p>
          <p style="margin:4px 0 0;font-size:20px;font-weight:800;color:#111111;">${escapeHtml(order.orderNumber ?? `#${order.id}`)}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 0;">
      ${itemRows(order)}
      ${totalsRows(order)}
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:800;color:#111111;">Total</td>
        <td align="right" style="padding:12px 0 0;font-size:15px;font-weight:800;color:#111111;">${formatInr(order.totalPrice)}</td>
      </tr>
    </table>

    <p style="margin:24px 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#999999;">Delivering to</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#444444;">${deliveryAddress(order)}</p>

    <p style="margin:20px 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#999999;">Payment</p>
    <p style="margin:0;font-size:14px;color:#444444;">${escapeHtml(paymentLabel(order))}</p>
  `;

  return shell({
    eyebrow: "Order confirmed",
    heading: "Thanks for your order",
    intro:
      "We have received your order and started getting it ready. You will hear from us again when it ships.",
    body,
    cta: { label: "View your orders", href: `${siteUrl()}/account/orders` },
  });
}

export function newOrderAlertHtml(order: Order) {
  const body = `
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:0 0 6px;">
      <tr>
        <td style="background:#f6f6f6;border:1px solid #e6e6e6;border-radius:14px;padding:14px 18px;">
          <p style="margin:0;font-size:20px;font-weight:800;color:#111111;">${escapeHtml(order.orderNumber ?? `#${order.id}`)}</p>
          <p style="margin:6px 0 0;font-size:14px;color:#444444;">${escapeHtml(paymentLabel(order))}</p>
        </td>
      </tr>
    </table>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:22px 0 0;">
      ${itemRows(order)}
      <tr>
        <td style="padding:12px 0 0;font-size:15px;font-weight:800;color:#111111;">Order total</td>
        <td align="right" style="padding:12px 0 0;font-size:15px;font-weight:800;color:#111111;">${formatInr(order.totalPrice)}</td>
      </tr>
    </table>

    <p style="margin:24px 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#999999;">Ship to</p>
    <p style="margin:0;font-size:14px;line-height:1.7;color:#444444;">${deliveryAddress(order)}</p>
    ${
      order.email
        ? `<p style="margin:8px 0 0;font-size:14px;color:#444444;">${escapeHtml(order.email)}</p>`
        : ""
    }
    ${
      order.customerNote
        ? `<p style="margin:20px 0 6px;font-size:12px;font-weight:700;letter-spacing:1px;text-transform:uppercase;color:#999999;">Customer note</p>
           <p style="margin:0;font-size:14px;color:#444444;">${escapeHtml(order.customerNote)}</p>`
        : ""
    }
  `;

  return shell({
    eyebrow: "New order",
    heading: `${formatInr(order.totalPrice)} order to pack`,
    intro: "A customer just completed checkout on TeeHub.",
    body,
    cta: {
      label: "Open in admin",
      href: `${siteUrl()}/admin/collections/orders/${order.id}`,
    },
  });
}

function plainTextSummary(order: Order) {
  const lines = (order.items ?? []).map(
    (item) =>
      `- ${item.name}${item.size ? ` (Size ${item.size})` : ""} x${item.quantity} — ${formatInr(item.price * item.quantity)}`,
  );
  return [
    `Order ${order.orderNumber ?? `#${order.id}`}`,
    "",
    ...lines,
    "",
    `Total: ${formatInr(order.totalPrice)}`,
    `Payment: ${paymentLabel(order)}`,
  ].join("\n");
}

/** Every admin account. Recipients are managed in /admin, no redeploy needed. */
async function staffRecipients(payload: Payload) {
  const admins = await payload.find({
    collection: "admins",
    limit: 100,
    depth: 0,
    overrideAccess: true,
    select: { email: true },
  });
  return admins.docs
    .map((admin) => admin.email)
    .filter((email): email is string => Boolean(email));
}

/**
 * Sends the customer receipt and the staff alert. Never throws and never
 * rejects — call it with `after()` so it runs once the response is on its way.
 */
export async function sendOrderEmails(payload: Payload, order: Order) {
  const reference = order.orderNumber ?? `#${order.id}`;

  const customerEmail = order.email?.trim();
  if (customerEmail) {
    try {
      await payload.sendEmail({
        to: customerEmail,
        subject: `Your TeeHub order ${reference} is confirmed`,
        html: orderConfirmationHtml(order),
        text: plainTextSummary(order),
      });
    } catch (error) {
      payload.logger.error(
        `Order confirmation email failed for ${reference}: ${
          error instanceof Error ? error.message : String(error)
        }`,
      );
    }
  } else {
    payload.logger.warn(
      `Order ${reference} has no email address; skipped the customer confirmation.`,
    );
  }

  try {
    const recipients = await staffRecipients(payload);
    if (recipients.length === 0) {
      payload.logger.warn(
        `Order ${reference} placed but no admin accounts have an email address to alert.`,
      );
      return;
    }
    await payload.sendEmail({
      to: recipients,
      subject: `New order ${reference} — ${formatInr(order.totalPrice)}`,
      html: newOrderAlertHtml(order),
      text: plainTextSummary(order),
      replyTo: customerEmail || undefined,
    });
  } catch (error) {
    payload.logger.error(
      `New-order staff alert failed for ${reference}: ${
        error instanceof Error ? error.message : String(error)
      }`,
    );
  }
}
