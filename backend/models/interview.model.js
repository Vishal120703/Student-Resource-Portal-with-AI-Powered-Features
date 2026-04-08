import mongoose from "mongoose";

const interviewSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },

    questions: [String],
    answers: [String],

    score: Number,
    communication: Number,
    technical: Number,
    confidence: Number,

    strengths: String,
    weaknesses: String,
    suggestions: String,
  },
  { timestamps: true }
);

export default mongoose.model("Interview", interviewSchema);