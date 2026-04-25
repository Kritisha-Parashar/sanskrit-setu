import express from "express";
import { z } from "zod";
import { pool } from "../db/connection";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { sendNotificationTemplateEmail } from "../services/sendResendEmail";
import type { ActiveEmailPreference } from "../services/emailTemplates";

const router = express.Router();

export const emailNotificationPreferenceSchema = z.enum(["none", "reminder", "weekly", "updates"]);

const patchSchema = z.object({
  emailNotificationPreference: emailNotificationPreferenceSchema,
});

router.get("/settings", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      `SELECT email_notification_preference FROM users WHERE id = $1`,
      [Number(req.userId)],
    );
    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }
    const raw = String(result.rows[0].email_notification_preference ?? "none")
      .trim()
      .toLowerCase();
    const allowed = ["none", "reminder", "weekly", "updates"] as const;
    const emailNotificationPreference = (allowed as readonly string[]).includes(raw)
      ? (raw as (typeof allowed)[number])
      : "none";
    res.json({ emailNotificationPreference });
  } catch (error) {
    console.error("GET /user/settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

router.patch("/settings", authenticateToken, async (req: AuthRequest, res) => {
  const parsed = patchSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({
      error: parsed.error.errors[0]?.message ?? "Invalid body",
    });
  }

  const nextPref = parsed.data.emailNotificationPreference;

  try {
    const prev = await pool.query(
      `SELECT email_notification_preference, email, name, username
       FROM users WHERE id = $1`,
      [Number(req.userId)],
    );
    if (prev.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const row = prev.rows[0];
    const userId = Number(req.userId);
    await pool.query(
      `UPDATE users SET email_notification_preference = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
      [nextPref, userId],
    );

    let emailDispatch: {
      attempted: boolean;
      ok?: boolean;
      error?: string;
      messageId?: string;
      skippedReason?: string;
    } = { attempted: false };

    if (nextPref !== "none") {
      const displayName =
        row.username?.trim() || row.name?.trim() || String(row.email).split("@")[0];
      emailDispatch.attempted = true;
      const sendResult = await sendNotificationTemplateEmail(
        String(row.email).trim(),
        nextPref as ActiveEmailPreference,
        displayName,
      );
      emailDispatch.ok = sendResult.ok;
      emailDispatch.error = sendResult.error;
      emailDispatch.messageId = sendResult.messageId;
    } else {
      emailDispatch.skippedReason = "notifications_off";
    }

    const userResult = await pool.query(
      `SELECT id, email, name, username, role, email_notification_preference FROM users WHERE id = $1`,
      [userId],
    );
    const u = userResult.rows[0];

    res.json({
      emailNotificationPreference: u.email_notification_preference ?? "none",
      user: {
        id: u.id.toString(),
        email: u.email,
        name: u.name,
        username: u.username || u.name || u.email.split("@")[0],
        role: u.role,
        emailNotificationPreference: u.email_notification_preference ?? "none",
      },
      emailDispatch,
    });
  } catch (error) {
    console.error("PATCH /user/settings error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
