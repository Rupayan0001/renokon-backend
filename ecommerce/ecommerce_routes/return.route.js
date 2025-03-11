import express from "express";
import { processReturnRequest } from "../services/returnService.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/process/:id", protect, async (req, res) => {
  const result = await processReturnRequest(req.params.id);
  res.status(200).json(result);
});

export default router;
