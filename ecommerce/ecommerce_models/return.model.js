import mongoose from "mongoose";

const ReturnSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    order: { type: mongoose.Schema.Types.ObjectId, ref: "Order", required: true },
    reason: { type: String, required: true },
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
    refundAmount: { type: Number },
    fraudScore: { type: Number, default: 0 }, // AI-detected fraud risk
  },
  { timestamps: true }
);

const Return = mongoose.model("Return", ReturnSchema);
export default Return;
