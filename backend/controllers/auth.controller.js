import {sendOtp} from "../utils/generateOtp.js";
import transporter  from "../services/nodemailer.js";
import { client } from "../config/redis.js";
import crypto from "crypto";
import User from "../models/auth.models.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const getAuth=(req,res)=>{
    return res.send("hello world");
}

export const generateOtp = async(req,res)=>{
    try{
        const {email} = req.body;
        if(!email) return res.status(400).json({msg:"first write your email."})
        const otp = await sendOtp();
        await client.set(`otp:${email}`,otp.toString(),{EX:300});
        const info = await transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: "OTP Varification",
            text: `Your OTP is  : ${otp}`,
        });
        return res.status(200).json({msg:"Otp-send"});
    }
    catch(err){
        return res.status(500).json({msg : "something went wrong"});
    }
}

export const verifyOTP = async(req,res)=>{
    try{
        const {email,otp} = req.body;
        if(!email|| !otp){
            return res.status(400).json({msg:"Enter your OTP"});
        }
        const storedOTP = await client.get(`otp:${email}`);
        if(!storedOTP){
            return res.status(400).json({msg : " not found "});
        }
        if(storedOTP != otp){
            return res.status(400).json({msg:"not matched"});
        }       
        await client.del(`otp:${email}`);
        const token = crypto.randomUUID();
        await client.set(`verify:${token}`, email, { EX: 600 });
        return res.status(200).json({
            msg: "OTP verified",
            token
        });
    }
    catch(err){
        return res.status(500).json({msg:"Something went wrong."})
    }
    
}

export const register = async(req,res)=>{
    try{
        const { token,username,name,password ,role} = req.body;
        if(!token||! username || !name || !password){
            return res.status(400).json({msg:"All feilds are required."})
        }
        const email = await client.get(`verify:${token}`);
        if (!email) {
            return res.status(400).json({ msg: "Invalid verification" });
        }
        const existingUser = await User.findOne({email});
        if (existingUser) {
            return res.status(400).json({ msg: "User already exists" });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({
            name,
            username,
            email,
            password: hashedPassword,
            role
        });
        await client.del(`verify:${token}`);
        return res.status(200).json({msg:"working",userId: user._id});
    }
    catch(err){
        return res.status(500).json({msg :"Something went wrong."})
    }
    
}

export const login = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({ msg: "All fields are required" });
        }

        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ msg: "Invalid credentials" });
        }

        const token = generateToken({
            id: user._id,
            role: user.role,
        });
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // true in production
            sameSite: "strict",
            maxAge: 7 * 60 * 60 * 1000,
        });

        return res.status(200).json({
            msg: "Login successful",
            token,
            user: {
                id: user._id,
                username: user.username,
                role: user.role,
            },
        });

    } catch (err) {
        console.error(err);
        return res.status(500).json({ msg: "Something went wrong" });
    }
};