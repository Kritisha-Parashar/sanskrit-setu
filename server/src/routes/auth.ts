import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import { pool } from "../db/connection";
import { authenticateToken, AuthRequest } from "../middleware/auth";
import { z } from "zod";

const router = express.Router();

const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

const changePasswordSchema = z.object({
  currentPassword: z.string().min(6),
  newPassword: z.string().min(6),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email(),
});

const resetPasswordSchema = z.object({
  token: z.string(),
  newPassword: z.string().min(6),
});

// Signup
router.post("/signup", async (req, res) => {
  const client = await pool.connect();
  
  try {
    console.log("Signup request received:", { body: req.body });
    
    const { email, password, name } = signupSchema.parse(req.body);
    
    console.log("Signup attempt for email:", email);

    // Start transaction
    await client.query("BEGIN");

    // Check if user already exists
    const existingUser = await client.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    if (existingUser.rows.length > 0) {
      await client.query("ROLLBACK");
      console.log("Signup failed: User already exists", email);
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Create user
    const result = await client.query(
      "INSERT INTO users (email, password_hash, name) VALUES ($1, $2, $3) RETURNING id, email, name, role",
      [email, passwordHash, name || email.split("@")[0]]
    );

    const user = result.rows[0];
    console.log("User created with ID:", user.id);

    // Create user progress entry with first lesson unlocked
    await client.query(
      "INSERT INTO user_progress (user_id, xp, completed_lessons, unlocked_lessons) VALUES ($1, $2, $3, $4)",
      [user.id, 0, [], ['LS001']]
    );
    console.log("User progress created for user ID:", user.id);

    // Commit transaction
    await client.query("COMMIT");

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Generate and store refresh token
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "your-secret-refresh-key-change-in-production";
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      refreshTokenSecret,
      { expiresIn: "30d" }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await client.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );

    console.log("Signup successful for email:", email);
    res.status(201).json({
      token,
      refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    // Rollback transaction on error
    await client.query("ROLLBACK").catch((rollbackErr) => {
      console.error("Rollback error:", rollbackErr);
    });
    
    if (error instanceof z.ZodError) {
      console.error("Signup validation error:", error.errors);
      return res.status(400).json({ 
        error: error.errors[0].message,
        details: process.env.NODE_ENV === "development" ? error.errors : undefined
      });
    }
    
    // Check for database connection errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("Database connection error:", error.message);
      return res.status(503).json({ 
        error: "Database connection failed. Please check your database configuration.",
        message: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
    
    // Check for duplicate key error
    if (error.code === "23505") {
      console.error("Duplicate email error:", error.message);
      return res.status(400).json({ error: "User with this email already exists" });
    }
    
    console.error("Signup error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  } finally {
    client.release();
  }
});

// Login
router.post("/login", async (req, res) => {
  try {
    console.log("Login request received:", { email: req.body?.email });
    
    const { email, password } = loginSchema.parse(req.body);

    // Find user
    const result = await pool.query(
      "SELECT id, email, password_hash, name, role FROM users WHERE email = $1",
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    const user = result.rows[0];

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Generate and store refresh token
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "your-secret-refresh-key-change-in-production";
    const refreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      refreshTokenSecret,
      { expiresIn: "30d" }
    );

    // Store refresh token in database
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30); // 30 days from now

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [user.id, refreshToken, expiresAt]
    );

    res.json({
      token,
      refreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      console.error("Login validation error:", error.errors);
      return res.status(400).json({ 
        error: error.errors[0].message,
        details: process.env.NODE_ENV === "development" ? error.errors : undefined
      });
    }
    
    // Check for database connection errors
    if (error.code === "ECONNREFUSED" || error.code === "ENOTFOUND") {
      console.error("Database connection error:", error.message);
      return res.status(503).json({ 
        error: "Database connection failed. Please check your database configuration.",
        message: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
    
    console.error("Login error:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      error: "Internal server error",
      message: process.env.NODE_ENV === "development" ? error.message : undefined
    });
  }
});

// Get current user
router.get("/me", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(
      "SELECT id, email, name, role FROM users WHERE id = $1",
      [req.userId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = result.rows[0];
    res.json({
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Get user error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Logout (client-side token removal, but we can add token blacklisting here if needed)
router.post("/logout", authenticateToken, async (req: AuthRequest, res) => {
  try {
    // Revoke all refresh tokens for this user
    await pool.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1",
      [req.userId]
    );
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Refresh token endpoint
router.post("/refresh", async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(400).json({ error: "Refresh token required" });
    }

    // Check if refresh token exists and is valid
    const tokenResult = await pool.query(
      "SELECT user_id FROM refresh_tokens WHERE token = $1 AND expires_at > NOW() AND revoked = FALSE",
      [refreshToken]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(401).json({ error: "Invalid or expired refresh token" });
    }

    const userId = tokenResult.rows[0].user_id;

    // Get user details
    const userResult = await pool.query(
      "SELECT id, email, name, role FROM users WHERE id = $1",
      [userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Generate new access token
    const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";
    const token = jwt.sign(
      { userId: user.id, email: user.email },
      jwtSecret,
      { expiresIn: "7d" }
    );

    // Optionally generate a new refresh token (rotate refresh tokens)
    const refreshTokenSecret = process.env.JWT_REFRESH_SECRET || "your-secret-refresh-key-change-in-production";
    const newRefreshToken = jwt.sign(
      { userId: user.id, email: user.email },
      refreshTokenSecret,
      { expiresIn: "30d" }
    );

    // Revoke old refresh token and create new one
    await pool.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE token = $1",
      [refreshToken]
    );

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    await pool.query(
      "INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, newRefreshToken, expiresAt]
    );

    res.json({
      token,
      refreshToken: newRefreshToken,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Request password reset
router.post("/forgot-password", async (req, res) => {
  try {
    const { email } = resetPasswordRequestSchema.parse(req.body);

    // Find user
    const userResult = await pool.query(
      "SELECT id FROM users WHERE email = $1",
      [email]
    );

    // Don't reveal if user exists or not (security best practice)
    if (userResult.rows.length === 0) {
      return res.json({ message: "If the email exists, a password reset link has been sent" });
    }

    const userId = userResult.rows[0].id;

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString("hex");
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 1); // Token expires in 1 hour

    // Store reset token
    await pool.query(
      "INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES ($1, $2, $3)",
      [userId, resetToken, expiresAt]
    );

    // In a real application, you would send an email here with the reset link
    // For now, we'll just return the token (remove this in production!)
    if (process.env.NODE_ENV === "development") {
      console.log(`Password reset token for ${email}: ${resetToken}`);
      res.json({
        message: "Password reset token generated (check console in development)",
        token: resetToken, // Remove this in production!
      });
    } else {
      res.json({ message: "If the email exists, a password reset link has been sent" });
    }
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Forgot password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Reset password with token
router.post("/reset-password", async (req, res) => {
  try {
    const { token, newPassword } = resetPasswordSchema.parse(req.body);

    // Find valid reset token
    const tokenResult = await pool.query(
      "SELECT user_id FROM password_reset_tokens WHERE token = $1 AND expires_at > NOW() AND used = FALSE",
      [token]
    );

    if (tokenResult.rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token" });
    }

    const userId = tokenResult.rows[0].user_id;

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, userId]
    );

    // Mark token as used
    await pool.query(
      "UPDATE password_reset_tokens SET used = TRUE WHERE token = $1",
      [token]
    );

    // Revoke all refresh tokens for security
    await pool.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1",
      [userId]
    );

    res.json({ message: "Password reset successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Reset password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Change password (requires authentication)
router.post("/change-password", authenticateToken, async (req: AuthRequest, res) => {
  try {
    const { currentPassword, newPassword } = changePasswordSchema.parse(req.body);

    // Get current user with password hash
    const userResult = await pool.query(
      "SELECT password_hash FROM users WHERE id = $1",
      [req.userId]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const user = userResult.rows[0];

    // Verify current password
    const isValidPassword = await bcrypt.compare(currentPassword, user.password_hash);

    if (!isValidPassword) {
      return res.status(401).json({ error: "Current password is incorrect" });
    }

    // Hash new password
    const saltRounds = 10;
    const passwordHash = await bcrypt.hash(newPassword, saltRounds);

    // Update password
    await pool.query(
      "UPDATE users SET password_hash = $1 WHERE id = $2",
      [passwordHash, req.userId]
    );

    // Revoke all refresh tokens for security
    await pool.query(
      "UPDATE refresh_tokens SET revoked = TRUE WHERE user_id = $1",
      [req.userId]
    );

    res.json({ message: "Password changed successfully" });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Change password error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
