import Return from "../models/Return.js";
import Order from "../models/Order.js";

export const processReturnRequest = async (returnId) => {
  const returnRequest = await Return.findById(returnId).populate("order");

  let fraudScore = 0;

  // AI-based fraud detection
  if (returnRequest.reason.toLowerCase().includes("fake") || returnRequest.reason.length < 10) {
    fraudScore += 50;
  }

  if (returnRequest.order.totalAmount > 500) {
    fraudScore += 20;
  }

  returnRequest.fraudScore = fraudScore;
  returnRequest.status = fraudScore > 50 ? "Rejected" : "Approved";

  await returnRequest.save();
  return returnRequest;
};
