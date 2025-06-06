import mongoose from "mongoose";
const transactionSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0 },
    type: {
      type: String,
      enum: ["Deposit", "Withdraw", "Winnings", "Purchase"],
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

const walletSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: "User", index: true, unique: true },
    balance: { type: Number, default: 0 },
    transactions: [transactionSchema],
    isLocked: { type: Boolean, default: false },
    withdrawalRequestAmount: { type: Number, default: 0 },
  },
  { timestamps: true }
);
const Wallet = mongoose.model("Wallet", walletSchema);
export default Wallet;

walletSchema.methods.updateBalance = async function (amount, type) {
  if (this.isLocked) throw new Error("Wallet is locked. Try again later.");

  this.isLocked = true;
  await this.save();

  if (type === "Deposit" || type === "Winnings" || type === "Transfer") {
    this.balance += amount;
  } else if (type === "Withdraw" || type === "Purchase") {
    if (this.balance < amount) throw new Error("Insufficient funds");
    this.balance -= amount;
  }

  this.transactions.push({ amount, type, status: "Completed" });
  await this.save();
  this.isLocked = false;
  await this.save();
};
