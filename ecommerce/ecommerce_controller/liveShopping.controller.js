import LiveShopping from "../models/LiveShopping.js";

// ✅ Create Live Shopping Event (Seller Only)
export const createLiveShopping = async (req, res) => {
  try {
    const { productId, startTime } = req.body;
    const liveShopping = new LiveShopping({ seller: req.user.id, product: productId, startTime });

    await liveShopping.save();
    res.status(201).json(liveShopping);
  } catch (error) {
    res.status(500).json({ error: "Error creating live shopping event" });
  }
};

// ✅ Get Live Shopping Events
export const getLiveShoppingEvents = async (req, res) => {
  try {
    const events = await LiveShopping.find().populate("product seller");
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ error: "Error fetching live shopping events" });
  }
};
