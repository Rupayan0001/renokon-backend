import PricingRule from "../models/PricingRule.js";
import Product from "../models/Product.js";
import axios from "axios";

export const adjustPrices = async () => {
  const pricingRules = await PricingRule.find().populate("product");

  for (let rule of pricingRules) {
    let newPrice = rule.product.price;

    // Adjust based on demand factor (simulate AI-based logic)
    newPrice *= rule.demandFactor;

    // Check competitor prices from an external API (mocked)
    try {
      const competitorData = await axios.get(`https://api.competitor-pricing.com/${rule.product._id}`);
      rule.competitorPrice = competitorData.data.price;
    } catch (error) {
      console.log("Competitor API failed", error);
    }

    // Adjust price to remain competitive
    if (rule.competitorPrice) {
      newPrice = Math.min(newPrice, rule.competitorPrice * 0.98); // 2% cheaper than competitor
    }

    // Ensure within price range
    newPrice = Math.max(rule.minPrice, Math.min(newPrice, rule.maxPrice));

    // Update product price
    await Product.findByIdAndUpdate(rule.product._id, { price: newPrice });
    await rule.save();
  }
};

import cron from "node-cron";
import { adjustPrices } from "../services/pricingService.js";

// Run every 6 hours
cron.schedule("0 */6 * * *", async () => {
  console.log("Adjusting prices...");
  await adjustPrices();
  console.log("Prices updated successfully.");
});
