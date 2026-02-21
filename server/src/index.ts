import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/auth";
import progressRoutes from "./routes/progress";
import lessonsRoutes from "./routes/lessons";
import diagnosticsRoutes from "./routes/diagnostics";
import adminRoutes from "./routes/admin";
import { initializeDatabase } from "./db/init";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
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

// --- START OF AI SCHOLAR ROUTE ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

app.post('/api/analyze-sanskrit', async (req, res) => {
  try {
    const { text } = req.body;
    
    // Changing to the newer, more reliable model name
    // If gemini-2.5-flash still gives 404, try "gemini-2.0-flash"
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
      You are an expert Sanskrit scholar. Analyze: "${text}"
      Return ONLY a valid JSON object. Do not include markdown or backticks.
      {
        "originalText": "Devanagari text",
        "transliteration": "Romanised text",
        "type": "Word/Sentence/Shloka",
        "englishMeaning": "English translation",
        "hindiMeaning": "Hindi translation",
        "grammarBreakdown": "Brief root/grammar info",
        "exampleSentenceSanskrit": "Example if word, else empty",
        "exampleSentenceMeaning": "Example meaning"
      }
    `;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text();
    
    // Safety check to extract JSON if AI adds extra text
    const startIdx = responseText.indexOf('{');
    const endIdx = responseText.lastIndexOf('}') + 1;
    
    if (startIdx === -1) {
      throw new Error("AI returned invalid data format");
    }
    
    const cleanJson = responseText.substring(startIdx, endIdx);
    res.json(JSON.parse(cleanJson));

  } catch (error: any) {
    console.error("AI Analysis Error:", error.message);
    res.status(500).json({ 
      error: "AI connection error", 
      details: error.message 
    });
  }
});
// --- END OF AI SCHOLAR ROUTE ---

// Health & Test
app.get("/api/health", (req, res) => res.json({ status: "ok" }));
app.get("/api/test", (req, res) => res.json({ message: "Server is running", port: PORT }));

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