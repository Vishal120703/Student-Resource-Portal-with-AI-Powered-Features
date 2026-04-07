// import { generateInterviewQuestions } from "../config/questionGeneration.js";
// import fs from "fs";
// import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";


// export const postInterview = async (req, res) => {
//     try {
//         const file = req.file;
//         let fullText = "";

//         if (!file) {
//             return res.status(400).json({
//                 success: false,
//                 msg: "Please upload your resume"
//             });
//         }

//         if (file.mimetype === "application/pdf") {
//             const data = new Uint8Array(fs.readFileSync(file.path));
//             const pdf = await pdfjsLib.getDocument({ data }).promise;

//             for (let i = 1; i <= pdf.numPages; i++) {
//                 const page = await pdf.getPage(i);
//                 const content = await page.getTextContent();
//                 const pageText = content.items.map(item => item.str).join(" ");
//                 fullText += pageText + "\n";
//             }
//         }

//         fs.unlinkSync(file.path);

//         fullText = fullText.slice(0, 2000);

//         console.log("📄 Resume Preview:", fullText.substring(0, 200));
//         console.log("📏 Length:", fullText.length);
//         const questions = await generateInterviewQuestions(fullText);
//         console.log(questions);

        
//         return res.status(200).json({
//             success: true,
//             msg: "Interview questions generated successfully",
//         });

//     } catch (err) {
//         console.error(" ERROR:", err);

//         return res.status(500).json({
//             success: false,
//             msg: "Server Error",
//             error: err.message
//         });
//     }
// };