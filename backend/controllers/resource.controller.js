import fs from "fs";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Tesseract from "tesseract.js";
import mammoth from "mammoth";
import officeParser from "officeparser";
import { main } from "../config/tagGeneration.js";

// image generation---->
async function extractTextFromImage(path) {
    const { data: { text } } = await Tesseract.recognize(path, "eng");
    return text;
}

// DOCX → Text ------->
async function extractTextFromDocx(path) {
    const result = await mammoth.extractRawText({ path });
    return result.value;
}

//  PPTX → Text ------->
async function extractTextFromPpt(path) {
    return new Promise((resolve, reject) => {
        officeParser.parseOffice(path, (data, err) => {
            if (err) reject(err);
            else resolve(data);
        });
    });
}


export const resourceUpload = async (req, res) => {
    try {
        const file = req.file;

        if (!file) {
            return res.status(400).json({ msg: "Upload file first" });
        }

        let fullText = "";

        // ---------------- PDF ---------------- //
        if (file.mimetype === "application/pdf") {
            const data = new Uint8Array(fs.readFileSync(file.path));
            const pdf = await pdfjsLib.getDocument({ data }).promise;

            for (let i = 1; i <= pdf.numPages; i++) {
                const page = await pdf.getPage(i);
                const content = await page.getTextContent();
                fullText += content.items.map(item => item.str).join(" ") + "\n";
            }
        }

        // ---------------- IMAGE ---------------- //
        else if (file.mimetype.startsWith("image/")) {
            fullText = await extractTextFromImage(file.path);
        }

        // ---------------- DOCX ---------------- //
        else if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        ) {
            fullText = await extractTextFromDocx(file.path);
        }

        // ---------------- PPTX ---------------- //
        else if (
            file.mimetype ===
            "application/vnd.openxmlformats-officedocument.presentationml.presentation"
        ) {
            fullText = await extractTextFromPpt(file.path);
        }

        // ---------------- UNSUPPORTED ---------------- //
        else {
            fs.unlinkSync(file.path);
            return res.status(400).json({ msg: "Unsupported file type" });
        }

        // ---------------- FALLBACK ---------------- //
        if (!fullText || !fullText.trim()) {
            fullText = "Study material content. Generate relevant tags.";
        }

        // ---------------- AI PROCESSING ---------------- //
        const aiRaw = await main(fullText.slice(0, 2000));

        let tags;
        try {
            tags = JSON.parse(aiRaw);
        } catch {
            tags = aiRaw; // fallback if not JSON
        }

        console.log("Generated Tags:", tags);

        // ---------------- CLEANUP ---------------- //
        fs.unlinkSync(file.path);

        // ---------------- RESPONSE ---------------- //
        return res.status(200).json({
            msg: "File processed successfully",
            tags
        });

    } catch (err) {
        console.error("ERROR:", err);

        // cleanup if file exists
        if (req.file?.path && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        return res.status(500).json({
            msg: "Server error",
            error: err.message
        });
    }
};