import express from "express";
import { searchProducts } from "../services/searchService.js";

const router = express.Router();

router.get("/", async (req, res) => {
  const products = await searchProducts(req.query.q);
  res.json(products);
});

export default router;
