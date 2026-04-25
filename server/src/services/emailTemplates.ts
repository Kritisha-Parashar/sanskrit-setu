export type ActiveEmailPreference = "reminder" | "weekly" | "updates";

function layout(inner: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:24px;background:#f6f4ef;font-family:system-ui,-apple-system,sans-serif;color:#1a1a1a;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:560px;margin:0 auto;background:#ffffff;border-radius:16px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,0.06);">
    <tr><td style="padding:28px 28px 8px;font-size:20px;font-weight:700;color:#8B4513;">Sanskrit-Setu</td></tr>
    <tr><td style="padding:8px 28px 28px;font-size:15px;line-height:1.55;">${inner}</td></tr>
  </table>
  <p style="max-width:560px;margin:16px auto 0;text-align:center;font-size:12px;color:#888;">You received this because of your email preferences on Sanskrit-Setu.</p>
</body>
</html>`;
}

export function buildEmailForPreference(
  preference: ActiveEmailPreference,
  displayName: string,
): { subject: string; html: string } {
  const name = displayName?.trim() || "learner";

  switch (preference) {
    case "reminder":
      return {
        subject: "Your Sanskrit practice reminder — Sanskrit-Setu",
        html: layout(`
          <p>Hi ${escapeHtml(name)},</p>
          <p>A quick nudge to keep your streak alive. Even a few minutes of practice today helps lock in what you learned.</p>
          <p>Open Sanskrit-Setu and pick up where you left off.</p>
          <p style="margin-top:24px;">— The Sanskrit-Setu team</p>
        `),
      };
    case "weekly":
      return {
        subject: "Your week on Sanskrit-Setu",
        html: layout(`
          <p>Hi ${escapeHtml(name)},</p>
          <p>Here is your <strong>weekly</strong> check-in: keep exploring lessons, earn XP, and revisit pronunciation practice to stay sharp.</p>
          <p>Consistency beats intensity — small sessions add up.</p>
          <p style="margin-top:24px;">— The Sanskrit-Setu team</p>
        `),
      };
    case "updates":
      return {
        subject: "Sanskrit-Setu — product updates",
        html: layout(`
          <p>Hi ${escapeHtml(name)},</p>
          <p>You are subscribed to <strong>product updates</strong>. We will use this channel for new features, improvements, and occasional tips for getting more from the platform.</p>
          <p>No lesson spam — just what is new and useful.</p>
          <p style="margin-top:24px;">— The Sanskrit-Setu team</p>
        `),
      };
  }
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}
