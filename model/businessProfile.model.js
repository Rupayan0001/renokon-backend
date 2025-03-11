import mongoose from "mongoose";

const BusinessProfileSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    businessName: {
      type: String,
      required: true,
    },
    industry: {
      type: String,
      required: true,
    },
    website: {
      type: String,
    },
    logo: {
      type: String,
    },
    coverImage: {
      type: String,
    },
    description: {
      type: String,
    },
    country: { type: String },
    city: { type: String },
    street: { type: String },
    zipCode: { type: String },
    email: { type: String, required: true },
    phone: { type: String },
    adAccountBalance: {
      type: Number,
      default: 0,
    },
    followersCount: {
      type: Number,
      default: 0,
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

const BusinessProfile = mongoose.model("BusinessProfile", BusinessProfileSchema);
export default BusinessProfile;
