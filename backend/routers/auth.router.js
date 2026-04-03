import express from "express"
import {getAuth,generateOtp,verifyOTP,register,login,logout} from "../controllers/auth.controller.js"
import { isAuthenticated } from "../middleware/auth.middleware.js";
const router = express.Router()

router.get("/",getAuth);
router.post("/send-otp",generateOtp);
router.post("/verify-otp",verifyOTP);
router.post("/register",register);
router.post("/login",login);
router.post("/logout",isAuthenticated,logout);

export default router;