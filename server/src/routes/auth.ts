import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
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

// Signup
router.post("/signup", async (req, res) => {
  const client = await pool.connect();
  
  try {
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

    // Create user progress entry
    await client.query(
      "INSERT INTO user_progress (user_id, xp, completed_lessons, unlocked_lessons) VALUES ($1, $2, $3, $4)",
      [user.id, 0, [], [1]]
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

    console.log("Signup successful for email:", email);
    res.status(201).json({
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    // Rollback transaction on error
    await client.query("ROLLBACK").catch(console.error);
    
    if (error instanceof z.ZodError) {
      console.error("Signup validation error:", error.errors);
      return res.status(400).json({ error: error.errors[0].message });
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

    res.json({
      token,
      user: {
        id: user.id.toString(),
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors[0].message });
    }
    console.error("Login error:", error);
    res.status(500).json({ error: "Internal server error" });
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
router.post("/logout", authenticateToken, (req: AuthRequest, res) => {
  // In a stateless JWT system, logout is handled client-side by removing the token
  // If you need server-side logout, implement token blacklisting
  res.json({ message: "Logged out successfully" });
});

export default router;
