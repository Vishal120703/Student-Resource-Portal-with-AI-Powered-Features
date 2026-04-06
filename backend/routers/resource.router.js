import express from "express"
import { upload } from "../middleware/upload.js";
import {resourceUpload} from "../controllers/resource.controller.js"

const router = express.Router();

router.post("/",upload.single("file"),resourceUpload);

export default router;
