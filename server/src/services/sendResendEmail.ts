import { Resend } from "resend";
import { ActiveEmailPreference, buildEmailForPreference } from "./emailTemplates";

let resendSingleton: Resend | null = null;
let cachedKey: string | null = null;

/** Reads key from env (strips BOM / whitespace). Use server/.env with override so it wins over a root .env. */
export function getResendApiKey(): string {
  const raw = process.env.RESEND_API_KEY ?? process.env.RESEND_KEY ?? "";
  return raw.replace(/^\uFEFF/, "").trim();
}

export function isResendConfigured(): boolean {
  return getResendApiKey().length > 0;
}

function getResend(): Resend | null {
  const key = getResendApiKey();
  if (!key) return null;
  if (cachedKey !== key) {
    cachedKey = key;
    resendSingleton = new Resend(key);
  } else if (!resendSingleton) {
    resendSingleton = new Resend(key);
  }
  return resendSingleton;
}

function formatResendError(error: { message: string; name?: string }): string {
  const code = error.name ? `${error.name}: ` : "";
  return `${code}${error.message}`.trim();
}

/**
 * Sends one transactional email using the template for the given preference type.
 */
export async function sendNotificationTemplateEmail(
  to: string,
  preference: ActiveEmailPreference,
  displayName: string,
): Promise<{ ok: boolean; error?: string; messageId?: string }> {
  const resend = getResend();
  if (!resend) {
    return {
      ok: false,
      error:
        "RESEND_API_KEY is missing in the running Node process. Use server/.env (not only the repo root), restart the server, and ensure no other .env sets RESEND_API_KEY empty before server/.env loads.",
    };
  }

  const toTrimmed = to.trim();
  if (!toTrimmed) {
    return { ok: false, error: "Recipient email is empty" };
  }

  const from =
    process.env.RESEND_FROM_EMAIL?.trim() || "Sanskrit-Setu <onboarding@resend.dev>";
  const { subject, html } = buildEmailForPreference(preference, displayName);

  try {
    const { data, error } = await resend.emails.send({
      from,
      to: [toTrimmed],
      subject,
      html,
    });

    if (error) {
      const msg = formatResendError(error);
      console.error("[Resend] send failed:", msg, { to: toTrimmed, from, preference });
      return { ok: false, error: msg };
    }

    if (!data?.id) {
      console.error("[Resend] missing id in response", { data, to: toTrimmed });
      return { ok: false, error: "Resend returned no message id" };
    }

    console.log("[Resend] email queued:", data.id, "to", toTrimmed, "template", preference);
    return { ok: true, messageId: data.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[Resend] exception:", msg);
    return { ok: false, error: msg };
  }
}
