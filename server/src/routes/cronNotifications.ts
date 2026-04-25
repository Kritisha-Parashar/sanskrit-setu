import express from "express";
import { z } from "zod";
import { pool } from "../db/connection";
import { sendNotificationTemplateEmail } from "../services/sendResendEmail";
import type { ActiveEmailPreference } from "../services/emailTemplates";

const router = express.Router();

const bodySchema = z.object({
  kind: z.enum(["reminder", "weekly", "updates"]),
});

/**
 * Intended to be called from a scheduler (cron, GitHub Actions, etc.).
 * Send header: x-cron-secret: <CRON_SECRET from env>
 */
router.post("/dispatch-email-notifications", async (req, res) => {
  const expected = process.env.CRON_SECRET?.trim();
  if (!expected) {
    return res.status(503).json({
      error: "CRON_SECRET is not configured on the server",
    });
  }
  const provided = req.headers["x-cron-secret"];
  if (typeof provided !== "string" || provided !== expected) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const parsed = bodySchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: "body.kind must be reminder, weekly, or updates" });
  }

  const kind = parsed.data.kind as ActiveEmailPreference;

  try {
    const result = await pool.query(
      `SELECT email,
              COALESCE(NULLIF(TRIM(username), ''), NULLIF(TRIM(name), ''), split_part(email, '@', 1)) AS display_name
       FROM users
       WHERE email_notification_preference = $1
         AND role = 'student'`,
      [kind],
    );

    let sent = 0;
    let failed = 0;
    const errors: string[] = [];

    for (const row of result.rows) {
      const r = await sendNotificationTemplateEmail(row.email, kind, row.display_name);
      if (r.ok) sent++;
      else {
        failed++;
        if (r.error && errors.length < 5) errors.push(`${row.email}: ${r.error}`);
      }
    }

    res.json({
      kind,
      total: result.rows.length,
      sent,
      failed,
      sampleErrors: errors,
    });
  } catch (error) {
    console.error("dispatch-email-notifications error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
