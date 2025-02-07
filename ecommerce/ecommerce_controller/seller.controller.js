import User from "../models/User.js";

// ✅ Register as Seller
export const registerAsSeller = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { role: "seller" });
    res.status(200).json({ message: "Seller account created" });
  } catch (error) {
    res.status(500).json({ error: "Error registering as seller" });
  }
};

// ✅ Get Seller Products
export const getSellerProducts = async (req, res) => {
  try {
    const products = await Product.find({ seller: req.user.id });
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching seller products" });
  }
};
