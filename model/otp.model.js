import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
  emailOtp: {
    type: String,
    required: true,
    default: "",
  },
  emailOtpExpire: {
    type: Date,
    default: Date.now,
    expires: 1800,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
});

const OTP = mongoose.model("OTP", otpSchema);

export default OTP;
