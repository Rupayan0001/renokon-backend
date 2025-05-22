import ProductModel from "../model/ecommerce_model/product.model.js";

export const getProducts = async (req, res) => {
  try {
    const products = await ProductModel.find({ _id: { $ne: null } }).sort({ order: 1 });
    if (!products) {
      return res.status(404).json({ message: "No products found" });
    }
    return res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
export const getProductById = async (req, res) => {
  try {
    const products = await req.db.collection("products").find().toArray();
    res.status(200).json(products);
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
