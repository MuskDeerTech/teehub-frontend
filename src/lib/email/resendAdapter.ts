import type { EmailAdapter, SendEmailOptions } from "payload";

type ResendResponse = {
  id?: string;
  message?: string;
  name?: string;
};

function addressToString(value: SendEmailOptions["to"]): string | string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => {
      const normalized = addressToString(entry);
      return Array.isArray(normalized) ? normalized : [normalized];
    }).filter(Boolean);
  }
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.address;
}

function normalizeRecipients(value: SendEmailOptions["to"]) {
  const normalized = addressToString(value);
  return Array.isArray(normalized) ? normalized : [normalized].filter(Boolean);
}

export function resendEmailAdapter({
  apiKey,
  fromAddress,
  fromName = "TeeHub",
}: {
  apiKey: string;
  fromAddress: string;
  fromName?: string;
}): EmailAdapter<ResendResponse> {
  return () => ({
    name: "resend",
    defaultFromAddress: fromAddress,
    defaultFromName: fromName,
    sendEmail: async (message) => {
      const to = normalizeRecipients(message.to);
      if (!to.length) throw new Error("Resend email requires at least one recipient.");

      const from = message.from
        ? String(addressToString(message.from as SendEmailOptions["to"]))
        : `${fromName} <${fromAddress}>`;

      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from,
          to,
          subject: message.subject,
          html: message.html,
          text: message.text,
          reply_to: message.replyTo
            ? addressToString(message.replyTo as SendEmailOptions["to"])
            : undefined,
        }),
      });

      const data = (await response.json().catch(() => ({}))) as ResendResponse;
      if (!response.ok) {
        throw new Error(data.message || `Resend email failed with ${response.status}.`);
      }
      return data;
    },
  });
}
