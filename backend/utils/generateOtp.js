import otpGenerator from "otp-generator"

const sendOtp =async() => {return otpGenerator.generate(6,{lowerCaseAlphabets:false,upperCaseAlphabets:false,specialChars:false});}

export {sendOtp};