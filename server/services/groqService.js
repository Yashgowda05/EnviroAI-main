const Groq = require("groq-sdk");

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

const analyzeTripRisk = async (tripData) => {
  const completion = await groq.chat.completions.create({
    model: "openai/gpt-oss-120b",

    messages: [
      {
        role: "system",
        content: `
You are an AI travel risk analyst.

Analyze the trip information provided by the user.

Return ONLY valid JSON.
Do not use markdown.
Do not add explanations outside the JSON.

Use exactly this structure:

{
  "overallRisk": "Low",
  "weatherRisk": "Low",
  "trafficRisk": "Low",
  "routeRisk": "Low",
  "alerts": [],
  "recommendation": ""
}

Risk values must be exactly one of:
"Low", "Moderate", "High"

The alerts field must be an array of short warning messages.
The recommendation field must contain practical travel advice.
        `,
      },
      {
        role: "user",
        content: JSON.stringify(tripData),
      },
    ],

    temperature: 0.2,

    response_format: {
      type: "json_object",
    },
  });

  return JSON.parse(completion.choices[0].message.content);
};

module.exports = {
  analyzeTripRisk,
};