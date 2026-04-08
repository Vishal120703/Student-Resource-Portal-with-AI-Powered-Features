import { SarvamAIClient } from "sarvamai";

const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAN_API
});

async function generateInterviewQuestions(text, position, experience, mode) {
    const prompt = `
You are an expert interview question generator.

Task:
Generate EXACTLY 5 ${mode} interview questions based on the resume.

Context:
- Position: ${position}
- Experience: ${experience}
- Mode: ${mode}

Instructions:
- Questions must be specific to the resume
- ${mode === "hr"
            ? "Focus on behavior, communication, and personality"
            : "Focus on technical skills, concepts, and problem-solving"}
- Avoid generic questions

STRICT OUTPUT RULE:
Return ONLY a valid JSON array.
No explanation, no text.

Format:
["Q1", "Q2", "Q3", "Q4", "Q5"]

Resume:
${text.slice(0, 3000)}
`;

    try {
        const response = await client.chat.completions({
            model: "sarvam-m",
            temperature: 0.3,
            messages: [{ role: "user", content: prompt }]
        });

        let output = response?.choices?.[0]?.message?.content?.trim();

        if (!output) throw new Error("Empty response from AI");

        output = output.replace(/```json|```/g, "").trim();

        const match = output.match(/\[.*\]/s);
        if (!match) throw new Error("No JSON found in AI response");

        const questions = JSON.parse(match[0]);

        if (!Array.isArray(questions) || questions.length !== 5) {
            throw new Error("Invalid question format");
        }

        return questions;

    } catch (error) {
        console.error("AI Error:", error.message);

        return [
            "Tell me about yourself.",
            "What are your strengths?",
            "Explain a project you worked on.",
            "What challenges have you faced?",
            "Why should we hire you?"
        ];
    }
}

export { generateInterviewQuestions };