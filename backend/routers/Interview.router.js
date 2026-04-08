import express from "express";
import { upload } from "../middleware/upload.js";
import { postQuestion,evaluateInterview } from "../controllers/Interview.controller.js";

const router = express.Router();

router.post("/",upload.single("resume"),postQuestion);
router.post("/evaluate", evaluateInterview);

export default router;
