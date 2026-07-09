import { GoogleGenerativeAI } from "@google/generative-ai";

// ✅ Gemini API initialize karein
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const generateResponse = async (prompt) => {
  try {
    if (!process.env.GEMINI_API_KEY) {
      throw new Error("GEMINI_API_KEY is missing in environment variables");
    }

    console.log("🤖 Calling Google Gemini API...");
    console.log("🔑 API Key present:", process.env.GEMINI_API_KEY ? "✅ Yes" : "❌ No");

    // ✅ Gemini model select karein
    const model = genAI.getGenerativeModel({ 
      model: "gemini-2.0-flash"  // ✅ Free & Fast
    });

    // ✅ System prompt + user prompt combine karein
    const systemPrompt = `You are an expert web development server. Return ONLY raw HTML code matching the user criteria. Do not talk, do not write markdown, do not wrap in backticks. Start with <!DOCTYPE html>.`;
    
    const fullPrompt = `${systemPrompt}\n\nUser Request: ${prompt}`;

    const result = await model.generateContent(fullPrompt);
    const response = await result.response;
    const content = response.text();

    if (!content) {
      console.error("❌ Invalid API response: Empty content");
      throw new Error("Invalid Gemini response structure");
    }

    console.log("✅ Gemini API response received");
    return content.trim();
  } catch (error) {
    console.error("❌ generateResponse ERROR:", error.message);
    throw error;
  }
};

export default generateResponse;