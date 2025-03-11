import mongoose from "mongoose";

const AdSchema = new mongoose.Schema(
  {
    businessId: { type: mongoose.Schema.Types.ObjectId, ref: "BusinessProfile", required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    image: { type: String, required: true },
    url: { type: String },
    budget: { type: Number, required: true },
    spent: { type: Number, default: 0 },
    clicks: { type: Number, default: 0 },
    impressions: { type: Number, default: 0 },
    engagements: { type: Number, default: 0 },
    conversions: { type: Number, default: 0 },
    revenue: { type: Number, default: 0 },
    location: { type: String, default: "India" },
    targetAudience: [{ type: String }],
    ageRange: { type: [Number], default: [18, 65] },
    gender: { type: String, enum: ["Male", "Female", "All"], default: "All" },
    device: { type: String, enum: ["Mobile", "Desktop", "All"], default: "All" },
    status: { type: String, enum: ["Active", "Paused", "Completed"], default: "Active" },
  },
  { timestamps: true }
);

const Admodel = mongoose.model("Ad", AdSchema);
export default Admodel;
