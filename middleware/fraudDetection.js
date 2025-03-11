export const detectFraud = (req, res, next) => {
  const { totalAmount, paymentMethod, orderItems } = req.body;

  if (totalAmount > 5000 && paymentMethod === "credit_card") {
    return res.status(403).json({ error: "High-value transactions require manual verification" });
  }

  if (orderItems.some((item) => item.quantity > 5)) {
    return res.status(403).json({ error: "Bulk orders require manual approval" });
  }

  next();
};
