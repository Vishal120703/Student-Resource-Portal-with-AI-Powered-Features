import express from "express";
import { upload } from "../middleware/upload.js";
import { postQuestion } from "../controllers/Interview.controller.js";

const router = express.Router();

router.post("/",upload.single("resume"),postQuestion);

export default router;
