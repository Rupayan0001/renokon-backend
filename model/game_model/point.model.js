import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["Deposit", "Withdraw", "Winnings", "Purchase", "Points"],
      required: true,
    },
    status: {
      type: String,
      enum: ["Pending", "Completed", "Failed"],
      default: "Pending",
    },
    referenceId: { type: String, unique: true, sparse: true },
  },
  { timestamps: true }
);

const pointSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true, unique: true },
    point: { type: Number, default: 0 },
    transactions: [transactionSchema],
  },
  { timestamps: true }
);
const Point = mongoose.model("Point", pointSchema);
export default Point;
