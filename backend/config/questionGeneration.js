// import { SarvamAIClient } from "sarvamai";

// const client = new SarvamAIClient({
//     apiSubscriptionKey: "sk_d808osnv_H79VewC72BLETiuUvaKYhjlL"
// });

// export async function generateInterviewQuestions(text) {
//     console.log(process.env.SARVAM_API);
//     const prompt = `
// You are an AI that generate questions for Interview

// Rules:
// - Generate EXACTLY 5 Questions
// - Each Questions on Resume basis
// - Output ONLY JSON

// Format:
// ["question1", "question2", "question3", "question4", "question5"]

// Content:
// ${text}
// `;

//     const response = await client.chat.completions({
//         model: "sarvam-m",
//         // temperature: 0.5,
//         messages: [
//             { role: "user", content: prompt }
//         ]
//     });

//     // const output = response.choices[0].message.content;
//    const output = response.choices[0].message.content;

//     try {
//         return JSON.parse(output);
//     } catch (error) {
//         console.error("Failed to parse JSON:", output);
//         return [];
//     }
// }