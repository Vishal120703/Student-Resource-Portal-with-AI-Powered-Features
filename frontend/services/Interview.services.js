import API from "../api/API";

export const generateQuestions = (formData)=>{
    return API.post("/interview",formData);
};