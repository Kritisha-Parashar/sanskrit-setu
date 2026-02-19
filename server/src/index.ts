import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import progressRoutes from "./routes/progress";
import lessonsRoutes from "./routes/lessons";
import diagnosticsRoutes from "./routes/diagnostics";
import adminRoutes from "./routes/admin";
import { initializeDatabase } from "./db/init";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
// CORS - Allow all origins in development for easier debugging
app.use(cors({
  origin: (origin, callback) => {
    // In development, allow all origins
    if (process.env.NODE_ENV !== "production") {
      callback(null, true);
      return;
    }
    
    // Allow requests with no origin (like mobile apps, Postman, or curl)
    if (!origin) {
      callback(null, true);
      return;
    }
    
    // Allow localhost on any port
    if (origin.startsWith("http://localhost") || origin.startsWith("http://127.0.0.1")) {
      callback(null, true);
      return;
    }
    
    callback(new Error("Not allowed by CORS"));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api", lessonsRoutes);
app.use("/api", diagnosticsRoutes);
app.use("/api/admin", adminRoutes);

// Health check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", timestamp: new Date().toISOString() });
});

// Test endpoint to verify server is accessible
app.get("/api/test", (req, res) => {
  res.json({ 
    message: "Server is running", 
    port: PORT,
    timestamp: new Date().toISOString() 
  });
});

// Initialize database and start server
initializeDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error("Failed to initialize database:", error);
    process.exit(1);
  });
