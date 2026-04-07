import express from "express"
import dotenv from "dotenv";
import authRouter from "./routers/auth.router.js"
import resourceRouter from "./routers/resource.router.js"
// import interviewRouter from "./routers/Interview.router.js"
import connectDB from "./config/db.js";
import { connectRedis } from "./config/redis.js";
import cookieParser from "cookie-parser";

dotenv.config();
connectDB();
await connectRedis();

const app = express();
const port = 3000||process.env.PORT;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use("/",authRouter);
app.use("/resource", resourceRouter);
// app.use("/interview",interviewRouter);

app.listen(port,()=>{
    console.log(`Server is running on port : ${port}`)
})