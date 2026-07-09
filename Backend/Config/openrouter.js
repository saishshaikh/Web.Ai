const openrouterurl = "https://openrouter.ai/api/v1/chat/completions";

const generateResponse = async (prompt) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is missing in .env");
    }

    const response = await fetch(openrouterurl, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "deepseek/deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              "You are an expert web development server. Return ONLY raw HTML code matching the user criteria. Do not talk, do not write markdown, do not wrap in backticks. Start with <!DOCTYPE html>.",
          },
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.2,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter error: ${errText}`);
    }

    const data = await response.json();
    const content = data?.choices?.[0]?.message?.content;

    if (!content) {
      throw new Error("Invalid OpenRouter response structure");
    }

    return content.trim();
  } catch (error) {
    console.error("generateResponse ERROR:", error.message);
    throw error;
  }
};

export default generateResponse;