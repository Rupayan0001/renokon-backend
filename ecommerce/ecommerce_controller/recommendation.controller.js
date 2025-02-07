import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ✅ Recommend Products Based on User's Orders
export const recommendProducts = async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.user.id }).populate("products.product");

    const purchasedCategoryIds = new Set(userOrders.flatMap((order) => order.products.map((p) => p.product.category.toString())));

    const recommendedProducts = await Product.find({ category: { $in: [...purchasedCategoryIds] } }).limit(5);

    res.status(200).json(recommendedProducts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching recommendations" });
  }
};

import Product from "../models/Product.js";
import Order from "../models/Order.js";

// ✅ AI-Powered Personalized Product Recommendations
export const getPersonalizedHomepage = async (req, res) => {
  try {
    const userOrders = await Order.find({ user: req.user.id }).populate("products.product");

    const purchasedCategoryIds = new Set(userOrders.flatMap((order) => order.products.map((p) => p.product.category.toString())));

    const recommendedProducts = await Product.find({ category: { $in: [...purchasedCategoryIds] } }).limit(8);
    res.status(200).json(recommendedProducts);
  } catch (error) {
    res.status(500).json({ error: "Error fetching recommendations" });
  }
};
