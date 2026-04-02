import mongoose from "mongoose"

const User = new mongoose.Schema({
    username:{
        type:String,
        unique:true,
        required:true
    },
    name :{
        type: String,
        trim:true,
        required:true
    },
    email:{
        type:String,
        lowercase:true,
        required:true
    },
    password:{
        type:String,
        required:true
    }
},
{timestamps:true}
)
const user = mongoose.model("user",User);
export default user;