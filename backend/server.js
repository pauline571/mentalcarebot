import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { GoogleGenerativeAI } from "@google/generative-ai";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Pour gérer __dirname avec ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "../public"))); // frontend

// Initialisation Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

// Route CHAT
app.post("/chat", async (req, res) => {
  const { message } = req.body;
  if (!message) return res.status(400).json({ answer: "Message manquant." });

  const prompt = `
Tu es MentalCareBot, un assistant de soutien émotionnel calme et bienveillant.
Ne donne pas de conseils médicaux, de diagnostic ou de traitement.
Réponds toujours dans la langue de l'utilisateur (FR ou EN).
Message utilisateur : ${message}
`;

  try {
    const result = await model.generateContent(prompt);

    let answer = "⚠️ Pas de réponse.";
    try {
      answer = result.response.candidates[0].content.parts[0].text;
    } catch {}

    res.json({ answer });

  } catch (error) {
    console.error("❌ Gemini error:", error);
    res.status(500).json({
      answer: "⚠️ Le bot est momentanément indisponible."
    });
  }
});

// Lancer le serveur
app.listen(PORT, () =>
  console.log(`✅ Serveur lancé sur le port ${PORT}`)
);
