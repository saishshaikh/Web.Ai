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
        "HTTP-Referer": "https://web-ai-3-84cy.onrender.com",
        "X-Title": "Web.Ai"
      },
      body: JSON.stringify({
        // "google/gemini-2.0-flash-lite-preview-02-05:free" बहुत स्टेबल है
        "model": "google/gemini-2.0-flash-lite-preview-02-05:free", 
        "messages": [
          {
            "role": "system",
            "content": "You are an expert web developer. Return ONLY raw HTML. No markdown, no backticks."
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

    const data = await response.json();

    if (!response.ok) {
      // अगर एरर आता है, तो इसे कंसोल में साफ देखें
      console.error("OpenRouter API Failed:", data);
      throw new Error(data.error?.message || "OpenRouter Request Failed");
    }

    return data.choices[0].message.content.trim();

  } catch (error) {
    console.error("GENERATE_RESPONSE_ERROR:", error.message);
    // यहाँ से एरर वापस भेजें ताकि फ्रंटएंड को पता चले
    throw error;
  }
};

export default generateResponse;