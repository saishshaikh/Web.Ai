const openrouterurl = "https://openrouter.ai/api/v1/chat/completions";

const generateResponse = async (prompt) => {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error("OPENROUTER_API_KEY is missing in Environment Variables");
    }

    const response = await fetch(openrouterurl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.OPENROUTER_API_KEY}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://web-ai-3-84cy.onrender.com", // आपकी लाइव साइट का लिंक
        "X-Title": "Web.Ai" // आपकी वेबसाइट का नाम
      },
      body: JSON.stringify({
        "model": "deepseek/deepseek-chat",
        "messages": [
          {
            "role": "system",
            "content": "You are an expert web development server. Return ONLY raw HTML code matching the user criteria. Do not talk, do not write markdown, do not wrap in backticks. Start with <!DOCTYPE html>."
          },
          {
            "role": "user",
            "content": prompt
          }
        ],
        "temperature": 0.2,
        "max_tokens": 4000
      }),
    });

    if (!response.ok) {
      // यह हिस्सा आपको बताएगा कि असली समस्या क्या है
      const errorData = await response.json().catch(() => ({}));
      console.error("OpenRouter Full Error:", JSON.stringify(errorData));
      throw new Error(`OpenRouter Error: ${response.status} - ${JSON.stringify(errorData)}`);
    }

    const data = await response.json();
    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error("GENERATE_RESPONSE_CRITICAL_ERROR:", error.message);
    throw error;
  }
};

export default generateResponse;