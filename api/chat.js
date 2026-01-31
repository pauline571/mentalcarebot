import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ answer: "Méthode non autorisée" });
  }

  const { message } = req.body;
  if (!message) {
    return res.status(400).json({ answer: "Message manquant." });
  }

  try {
    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

    const prompt = `
Tu es MentalCareBot, un assistant de soutien émotionnel calme et bienveillant.
Ne donne pas de conseils médicaux.
Réponds dans la langue de l'utilisateur.
Message utilisateur : ${message}
`;

    const result = await model.generateContent(prompt);
    const answer =
      result.response.candidates[0].content.parts[0].text;

    res.status(200).json({ answer });

  } catch (error) {
    console.error(error);
    res.status(500).json({
      answer: "⚠️ Le bot est momentanément indisponible."
    });
  }
}
