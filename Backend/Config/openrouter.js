import { GoogleGenerativeAI } from "@google/generative-ai";

// Gemini API initialize
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    console.log("🤖 Calling Google Gemini API...");
    console.log(
      "🔑 API Key present:",
      process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No"
    );

    // Gemini model
    const model = genAI.getGenerativeModel({
      model: "gemini-2.5-flash",
    });

    const systemPrompt = `
You are an expert web development server.
Return ONLY raw HTML code matching the user criteria.
Do not talk.
Do not write markdown.
Do not wrap in backticks.
Start with <!DOCTYPE html>.
`;

    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    try {
      const result = await model.generateContent(fullPrompt);

      const response = await result.response;
      const content = response.text();

      if (!content) {
        throw new Error("Invalid Gemini response structure");
      }

      console.log("✅ Gemini API response received");
      return content.trim();
    } catch (err) {
      console.error("Gemini Error:", err);

      if (err.message.includes("429")) {
        throw new Error(
          "Gemini quota exceeded. Please enable billing or use another Gemini project."
        );
      }

      throw err;
    }
  } catch (error) {
    console.error("❌ generateResponse ERROR:", error.message);
    throw error;
  }
};

export default generateResponse;