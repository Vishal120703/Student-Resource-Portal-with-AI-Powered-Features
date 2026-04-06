import { SarvamAIClient } from "sarvamai";
const client = new SarvamAIClient({
    apiSubscriptionKey: process.env.SARVAN_API
});

export async function main(text){
    const prompt = `
You are an AI that extracts tags from study material.

Rules:
- Generate EXACTLY 5 tags
- Each tag = 1-2 words only
- No sentence
- Output ONLY JSON

Format:
["tag1", "tag2", "tag3", "tag4", "tag5"]

Content:
${text}
`;

    const response = await client.chat.completions({
        model: "sarvam-m",
        messages: [
            { role: "user", content: prompt }
        ]
    });

    return response.choices[0].message.content;
}

