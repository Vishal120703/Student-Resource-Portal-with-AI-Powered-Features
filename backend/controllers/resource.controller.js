import fs from 'fs';
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";


export const resourceUpload = async(req,res)=>{
    try{
        const file = req.file;
        if(!file){
            return res.status(400).json({msg:"Upload file first"});
        }
        const data = new Uint8Array(fs.readFileSync(req.file.path));
        const loadingTask = pdfjsLib.getDocument({ data });
        const pdf = await loadingTask.promise;
        let fullText = "";
        for (let i = 1; i <= pdf.numPages; i++) {
            const page = await pdf.getPage(i);
            const content = await page.getTextContent();
            const strings = content.items.map(item => item.str);
            fullText += strings.join(" ") + "\n";
        }
        console.log(fullText);
        fs.unlinkSync(req.file.path);
        
        return res.status(200).json({
            msg: "PDF read successfully"
        });

    }
    catch(err){
        console.error("ERROR:", err);   // 👈 ADD THIS
    return res.status(500).json({ msg: err.message });
    }

}