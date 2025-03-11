import Coupon from "../models/Coupon.js";

// ✅ Create Coupon (Admin)
export const createCoupon = async (req, res) => {
  try {
    const { code, discount, expirationDate } = req.body;

    const coupon = new Coupon({ code, discount, expirationDate });
    await coupon.save();

    res.status(201).json(coupon);
  } catch (error) {
    res.status(500).json({ error: "Error creating coupon" });
  }
};

// ✅ Apply Coupon
export const applyCoupon = async (req, res) => {
  try {
    const { code } = req.body;
    const coupon = await Coupon.findOne({ code, isActive: true });

    if (!coupon || new Date() > new Date(coupon.expirationDate)) {
      return res.status(400).json({ error: "Invalid or expired coupon" });
    }

    res.status(200).json({ discount: coupon.discount });
  } catch (error) {
    res.status(500).json({ error: "Error applying coupon" });
  }
};
