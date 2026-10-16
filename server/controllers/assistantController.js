const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `
You are EnviroAI, an intelligent AI travel assistant.

Your responsibilities:
1. Help users plan trips and itineraries.
2. Suggest destinations, attractions, and travel activities.
3. Provide general weather-related travel precautions.
4. Recommend practical ways to improve travel safety.
5. Encourage eco-friendly transportation and sustainable tourism.
6. Help users understand the environmental impact of travel.
7. Give clear, friendly, structured answers.

Rules:
- Ask follow-up questions when essential trip details are missing.
- Never invent live weather, AQI, traffic, route, or distance data.
- Explain when current data has not been retrieved from an external API.
- Do not claim a route has been verified by Google Maps unless the
  application has actually retrieved that route.
- Do not claim that general advice guarantees safety.
- For urgent weather warnings, advise users to check official sources.
- Prefer useful lists and step-by-step recommendations.
- Keep answers relevant to the user's question.
`;

const chatWithAssistant = async (req, res) => {
  try {
    const { message, history = [] } = req.body;

    if (
      typeof message !== "string" ||
      !message.trim()
    ) {
      return res.status(400).json({
        success: false,
        message: "Please enter a question.",
      });
    }

    if (message.length > 4000) {
      return res.status(400).json({
        success: false,
        message:
          "Your question is too long. Please keep it under 4000 characters.",
      });
    }

    if (!process.env.GROQ_API_KEY) {
      console.error("GROQ_API_KEY is missing.");

      return res.status(503).json({
        success: false,
        message:
          "AI service is not configured. Add GROQ_API_KEY to the server environment.",
      });
    }

    // Accept only user and assistant messages from recent history.
    const safeHistory = Array.isArray(history)
      ? history
          .filter(
            (item) =>
              item &&
              ["user", "assistant"].includes(item.role) &&
              typeof item.content === "string" &&
              item.content.trim().length > 0 &&
              item.content.length <= 4000
          )
          .slice(-10)
          .map((item) => ({
            role: item.role,
            content: item.content,
          }))
      : [];

    const requestMessages = [
      {
        role: "system",
        content: SYSTEM_PROMPT,
      },
      ...safeHistory,
      {
        role: "user",
        content: message.trim(),
      },
    ];

    const controller = new AbortController();

    const timeout = setTimeout(() => {
      controller.abort();
    }, 45000);

    let groqResponse;

    try {
      groqResponse = await fetch(GROQ_API_URL, {
        method: "POST",

        headers: {
          Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
          "Content-Type": "application/json",
        },

       body: JSON.stringify({
  model:
    process.env.GROQ_MODEL ||
    "openai/gpt-oss-120b",

  messages: requestMessages,
  temperature: 0.5,
  max_tokens: 1200,
}),

        signal: controller.signal,
      });
    } finally {
      clearTimeout(timeout);
    }

    if (!groqResponse.ok) {
      const errorBody = await groqResponse.text();

      console.error(
        "Groq API error:",
        groqResponse.status,
        errorBody.slice(0, 1000)
      );

      if (
        groqResponse.status === 401 ||
        groqResponse.status === 403
      ) {
        return res.status(502).json({
          success: false,
          message:
            "The AI provider rejected the API credentials. Check your Groq API key.",
        });
      }

      if (groqResponse.status === 429) {
        return res.status(503).json({
          success: false,
          message:
            "The AI service is temporarily rate-limited. Please try again later.",
        });
      }

      return res.status(502).json({
        success: false,
        message:
          "The AI provider could not process your request. Please try again later.",
      });
    }

    const result = await groqResponse.json();

    const reply =
      result.choices?.[0]?.message?.content;

    if (
      typeof reply !== "string" ||
      !reply.trim()
    ) {
      return res.status(502).json({
        success: false,
        message:
          "The AI provider returned an empty response.",
      });
    }

    return res.status(200).json({
      success: true,
      reply: reply.trim(),
    });
  } catch (error) {
    if (error.name === "AbortError") {
      return res.status(504).json({
        success: false,
        message:
          "The AI request timed out. Please try again.",
      });
    }

    console.error("AI assistant error:", error);

    return res.status(500).json({
      success: false,
      message:
        "An unexpected error occurred while processing your question.",
    });
  }
};

module.exports = {
  chatWithAssistant,
};