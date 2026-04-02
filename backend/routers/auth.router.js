import express from "express"
import {getAuth} from "../controllers/auth.controller.js"
const router = express.Router()

router.get("/",getAuth);

export default router;