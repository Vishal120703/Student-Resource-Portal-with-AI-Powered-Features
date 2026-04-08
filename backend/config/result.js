import dotenv from "dotenv";
dotenv.config();

export const evaluateWithAI = async (qaText) => {
  const prompt = `
You are an interview evaluator.

Evaluate the candidate based on:
- Communication
- Technical knowledge
- Confidence

Give:
1. Score out of 100
2. Strengths
3. Weaknesses
4. Suggestions

Interview:
${qaText}
`;

  try {
    const response = await fetch("https://api.sarvam.ai/v1/chat/completions", { // ✅ correct URL (example)
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.SARVAN_API}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "sarvam-m", // or correct model
        messages: [
          {
            role: "user",
            content: prompt,
          },
        ],
      }),
    });

    const data = await response.json();

    console.log("AI RESPONSE:", data);

    return {
      score: 85, // temp
      feedback: data.choices?.[0]?.message?.content || "No feedback",
    };

  } catch (err) {
    console.error("AI ERROR:", err);
    return {
      score: 0,
      feedback: "Evaluation failed",
    };
  }
};