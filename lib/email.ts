import { Resend, type Tag } from "resend";

type SendEmailInput = {
  to: string | string[];
  subject: string;
  html: string;
  text?: string;
  fromName?: string;
  replyTo?: string | string[];
  idempotencyKey: string;
  tags?: Tag[];
};

type SendEmailResult =
  | { ok: true; id: string }
  | { ok: false; message: string; name?: string };

let resendClient: Resend | null = null;

function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    return { error: "RESEND_API_KEY is not configured." };
  }

  resendClient ||= new Resend(apiKey);
  return { client: resendClient };
}

function cleanSenderName(value?: string) {
  return value?.replace(/[\r\n<>"]/g, "").trim();
}

function getFromAddress(fromName?: string) {
  const senderEmail = process.env.RESEND_FROM_EMAIL?.trim();
  if (!senderEmail) {
    return { error: "RESEND_FROM_EMAIL is not configured." };
  }

  if (process.env.NODE_ENV === "production" && senderEmail.endsWith("@resend.dev")) {
    return { error: "Use a verified production domain for RESEND_FROM_EMAIL." };
  }

  const senderName =
    cleanSenderName(fromName) ||
    cleanSenderName(process.env.RESEND_FROM_NAME) ||
    "Pinglly CRM";
  return { from: `${senderName} <${senderEmail}>` };
}

export async function sendEmail(input: SendEmailInput): Promise<SendEmailResult> {
  const clientResult = getResendClient();
  if (clientResult.error || !clientResult.client) {
    return { ok: false, message: clientResult.error || "Resend is not configured." };
  }

  const fromResult = getFromAddress(input.fromName);
  if (fromResult.error || !fromResult.from) {
    return { ok: false, message: fromResult.error || "Sender email is not configured." };
  }

  const configuredReplyTo = process.env.RESEND_REPLY_TO_EMAIL?.trim();
  const { data, error } = await clientResult.client.emails.send(
    {
      from: fromResult.from,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
      replyTo: input.replyTo || configuredReplyTo || undefined,
      tags: input.tags,
    },
    {
      idempotencyKey: input.idempotencyKey,
    },
  );

  if (error) {
    return { ok: false, message: error.message, name: error.name };
  }

  return { ok: true, id: data?.id || "" };
}
