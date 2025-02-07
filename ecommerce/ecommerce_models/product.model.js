import mongoose from "mongoose";

const ProductSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    price: { type: Number, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category" },
    stock: { type: Number, required: true },
    images: [{ type: String }],
    seller: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    ratings: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Product = mongoose.model("Product", ProductSchema);
export default Product;
