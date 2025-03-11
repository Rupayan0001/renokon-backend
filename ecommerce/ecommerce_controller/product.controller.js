import Product from "../models/Product.js";

// ✅ Create Product (Seller only)
export const createProduct = async (req, res) => {
  try {
    if (req.user.role !== "seller") return res.status(403).json({ error: "Unauthorized" });

    const { name, description, price, category, stock } = req.body;
    const images = req.files.map((file) => file.path);

    const product = new Product({
      name,
      description,
      price,
      category,
      stock,
      images,
      seller: req.user.id,
    });

    await product.save();
    res.status(201).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error creating product" });
  }
};

// ✅ Get All Products
export const getProducts = async (req, res) => {
  try {
    const products = await Product.find().populate("category seller", "name email");
    res.status(200).json(products);
  } catch (error) {
    res.status(500).json({ error: "Error fetching products" });
  }
};

// ✅ Get Single Product
export const getProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate("category seller", "name email");
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.status(200).json(product);
  } catch (error) {
    res.status(500).json({ error: "Error fetching product" });
  }
};
