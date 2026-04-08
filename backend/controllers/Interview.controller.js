import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import {generateInterviewQuestions} from "../config/questionGeneration.js";
import { evaluateWithAI } from "../config/result.js";
import Interview from "../models/interview.model.js";
const postQuestion = async(req,res)=>{
    try{
        const file = req.file;
        const {position,experience,mode} = req.body;
        if(!position || !experience || !mode){
            return res.status(400).json({msg:"Fill All the required fields."})
        }
        if(!file){
            return res.status(400).json({msg:"Fill All the required fields."})
        }
        let fullText = "";
        
        if (file.mimetype === "application/pdf") {
            const data = new Uint8Array(fs.readFileSync(file.path));
            const pdf = await pdfjsLib.getDocument({ data }).promise;
        
            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map(item => item.str).join(" ") + "\n";
            }
        }else {
            return res.status(400).json({
                msg: "Only PDF files allowed",
            });
        }
        fullText.slice(0,3000);
        const questions = await generateInterviewQuestions(fullText,position,experience,mode);
        fs.unlinkSync(file.path);
        // console.log(questions);
        return res.status(200).json({msg:"everything is working",questions});
    }
    catch(err){
        return res.status(500).json({msg:"Somethign went wrong"});
    }
}



const evaluateInterview = async (req, res) => {
  try {
    const { questions, answers } = req.body;

    if (!questions || !answers) {
      return res.status(400).json({ msg: "Missing data" });
    }
    console.log(questions);
    console.log(answers);

    // Combine Q&A
    let qaText = "";

    for (let i = 0; i < questions.length; i++) {
      qaText += `Q${i + 1}: ${questions[i]}\n`;
      qaText += `A${i + 1}: ${answers[i]}\n\n`;
    }
    console.log(qaText);

    // 👉 Send to AI for evaluation
    const evaluation = await evaluateWithAI(qaText);
    console.log(evaluation);
    if (!evaluation || typeof evaluation.score !== "number") {
  console.log("AI FAILED:", evaluation);
  return res.status(500).json({ msg: "AI failed" });
}

    const savedInterview = await Interview.create({
      userId: req.user?.id || null, // if auth exists
      questions,
      answers,
      score: evaluation.score,
      communication: evaluation.communication,
      technical: evaluation.technical,
      confidence: evaluation.confidence,
      strengths: evaluation.strengths,
      weaknesses: evaluation.weaknesses,
      suggestions: evaluation.suggestions,
    });

    return res.status(200).json({
      success: true,
      data: savedInterview,
    });

  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: "Server error" });
  }
};

const getInterviewHistory = async (req, res) => {
  try {
    const interviews = await Interview.find({
      userId: req.user?.id,
    }).sort({ createdAt: 1 });

    res.json(interviews);
  } catch (err) {
    res.status(500).json({ msg: "Error fetching history" });
  }
};

export {postQuestion,evaluateInterview,getInterviewHistory};