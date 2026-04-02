import express from "express"
const app = express();
require('dotenv').config();
const port = 3000||process.env.PORT;

app.get("/",(req,res)=>{
    res.send("hello world");
})

app.listen(port,()=>{
    console.log(`Server is running on port : ${port}`)
})