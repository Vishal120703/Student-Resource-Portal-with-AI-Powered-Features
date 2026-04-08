import dotenv from "dotenv";
dotenv.config();

export const evaluateWithAI = async (qaText) => {
  const prompt = `
You are a professional interview evaluator.

Analyze the interview and return ONLY valid JSON in this format:

{
  "score": number (0-100),
  "communication": number (0-100),
  "technical": number (0-100),
  "confidence": number (0-100),
  "strengths": "text",
  "weaknesses": "text",
  "suggestions": "text"
}

Rules:
- Do NOT add anything outside JSON
- Do NOT include <think>
- Keep answers short and clear

Interview:
${qaText}
`;

  const fallback = {
    score: 0,
    communication: 0,
    technical: 0,
    confidence: 0,
    strengths: "Could not evaluate",
    weaknesses: "AI response invalid",
    suggestions: "Try again",
  };

  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAN_API}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m",
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
        temperature: 0.3,
      }),
    });

    const data = await response.json();

    console.log("RAW AI RESPONSE:", data);

    const aiText = data?.choices?.[0]?.message?.content;

    if (!aiText) {
      console.log("No AI text");
      return fallback;
    }

    // 🔥 Extract JSON
    const jsonMatch = aiText.match(/{[\s\S]*}/);

    if (!jsonMatch) {
      console.log("No JSON found:", aiText);
      return fallback;
    }

    let parsed;

    try {
      parsed = JSON.parse(jsonMatch[0]);
    } catch (err) {
      console.log("Parse error:", err);
      return fallback;
    }

    // ✅ Validate structure
    if (
      typeof parsed.score !== "number" ||
      typeof parsed.communication !== "number"
    ) {
      console.log("Invalid structure:", parsed);
      return fallback;
    }

    return parsed;

  } catch (err) {
    console.error("AI ERROR:", err);
    return fallback;
  }
};