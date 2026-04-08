import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import {generateInterviewQuestions} from "../config/questionGeneration.js";

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

export {postQuestion};