import mongoose from "mongoose";

const PricingRuleSchema = new mongoose.Schema(
  {
    product: { type: mongoose.Schema.Types.ObjectId, ref: "Product", required: true },
    minPrice: { type: Number, required: true },
    maxPrice: { type: Number, required: true },
    competitorPrice: { type: Number, default: null }, // Competitor's price tracking
    demandFactor: { type: Number, default: 1 }, // AI-calculated demand factor (1 = normal, >1 = high demand)
  },
  { timestamps: true }
);

const PricingRule = mongoose.model("PricingRule", PricingRuleSchema);
export default PricingRule;
