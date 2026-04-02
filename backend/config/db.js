import mongoose from "mongoose";

async function connectDB(){
    try{
        await mongoose.connect(process.env.MONGO_DB);
        console.log("Database is connected");
    }
    catch(err){
        console.log("Something went wrong in DB");

    }
}

export default connectDB;