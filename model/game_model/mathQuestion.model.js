import mongoose from "mongoose";

const Mathsquestions = new mongoose.Schema(
  {
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String],
      required: true,
      validate: [arrayLimit, "Options must contain exactly 4 choices"],
    },
    correct_answer: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

function arrayLimit(val) {
  return val.length === 4;
}

const Question = mongoose.model("Mathsquestions", Mathsquestions);

export default Question;
