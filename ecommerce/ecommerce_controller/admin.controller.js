import User from "../models/User.js";
import Order from "../models/Order.js";

// ✅ Get Sales Statistics
export const getSalesStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalRevenue = (await Order.find({ status: "Paid" })).reduce((sum, order) => sum + order.totalAmount, 0);

    res.status(200).json({ totalUsers, totalOrders, totalRevenue });
  } catch (error) {
    res.status(500).json({ error: "Error fetching stats" });
  }
};
