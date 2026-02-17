import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { pool } from "../db/connection";

export interface AuthRequest extends Request {
  userId?: number;
  userEmail?: string;
  userRole?: string;
}

export const authenticateToken = async (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  const jwtSecret = process.env.JWT_SECRET || "your-secret-key-change-in-production";

  jwt.verify(token, jwtSecret, async (err: any, decoded: any) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }

    req.userId = decoded.userId;
    req.userEmail = decoded.email;
    
    // Fetch user role from database
    try {
      const userResult = await pool.query(
        "SELECT role FROM users WHERE id = $1",
        [decoded.userId]
      );
      if (userResult.rows.length > 0) {
        req.userRole = userResult.rows[0].role;
      }
    } catch (error) {
      console.error("Error fetching user role:", error);
    }
    
    next();
  });
};

export const requireAdmin = (
  req: AuthRequest,
  res: Response,
  next: NextFunction
) => {
  if (req.userRole !== "admin") {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
};
