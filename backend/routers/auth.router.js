import express from "express"
import {getAuth,generateOtp,verifyOTP,register} from "../controllers/auth.controller.js"
const router = express.Router()

router.get("/",getAuth);
router.post("/send-otp",generateOtp);
router.post("/verify-otp",verifyOTP);
router.post("/register",register);

export default router;