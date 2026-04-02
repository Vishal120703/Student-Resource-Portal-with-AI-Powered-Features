import express from "express"
import dotenv from "dotenv";
import authRouter from "./routers/auth.router.js"
import connectDB from "./config/db.js";

dotenv.config();
connectDB();

const app = express();
const port = 3000||process.env.PORT;

app.use(express.json());
app.use("/",authRouter);

app.listen(port,()=>{
    console.log(`Server is running on port : ${port}`)
})