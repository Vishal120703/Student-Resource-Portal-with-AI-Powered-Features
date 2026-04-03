import mongoose from "mongoose"

const user = new mongoose.Schema({
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
        unique:true,
        required:true
    },
    role:{
        type:String,
        enum:["Admin","Student","Teacher"],
        default:"Student"
    },
    password:{
        type:String,
        required:true
    }
},
{timestamps:true}
)
const User = mongoose.model("User",user);
export default User;