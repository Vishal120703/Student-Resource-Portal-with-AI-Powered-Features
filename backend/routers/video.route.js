import express from "express";
import multer from "multer";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + ".webm");
  },
});

const upload = multer({ storage });

router.post("/upload-video", upload.single("video"), (req, res) => {
  console.log("Video saved:", req.file.filename);

  res.json({ success: true });
});

export default router;