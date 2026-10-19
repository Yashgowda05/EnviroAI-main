const GROQ_API_URL =
  "https://api.groq.com/openai/v1/chat/completions";

const SYSTEM_PROMPT = `
You are EnviroAI, a friendly and intelligent AI travel assistant.

Your responsibilities:
1. Help users plan trips and itineraries.
2. Suggest destinations, attractions, and activities.
3. Provide general weather-related travel precautions.
4. Recommend practical travel safety measures.
5. Encourage eco-friendly transportation and sustainable tourism.
6. Explain the environmental impact of travel.

IMPORTANT RESPONSE FORMATTING RULES:

1. Write in natural, human-readable language, like a helpful travel guide.
2. Avoid Markdown tables. Never use tables for itineraries, schedules,
   weather information, or packing lists.
3. Use short paragraphs and clear sentences.
4. Use simple headings to separate sections.
5. Use bullet points only when they improve readability.
6. For itineraries, organize the response by day.
7. Within each day, show activities in chronological order.
8. Give each activity a heading containing its time and activity name.
9. Explain each activity in one short, useful paragraph.
10. Use a few relevant emojis to make travel plans engaging, but do not
    overload the response with emojis.
11. Use readable spacing between sections.
12. Avoid excessive Markdown formatting, HTML, JSON, and code blocks
    unless the user specifically requests them.
13. Do not return the entire itinerary as one large paragraph.
14. Keep the response friendly, organized, and easy to understand.
15. For short questions, answer directly without unnecessary sections.
16. If important trip details are missing, ask relevant follow-up questions.

ACCURACY AND SAFETY RULES:

1. Never invent live weather, AQI, traffic, route, distance, prices,
   opening hours, or availability.
2. Clearly distinguish estimates from verified live information.
3. Do not claim that Google Maps verified a route unless the application
   actually retrieved that route.
4. Do not claim that a hotel, restaurant, farm, or activity is available
   unless verified.
5. For urgent weather warnings, advise users to check official sources.
6. Do not claim that general advice guarantees safety.

Your goal is to make every response easy for an ordinary person to read,
understand, and use while planning a journey.
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