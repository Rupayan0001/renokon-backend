import Order from "../models/Order.js";

// ✅ Create Order
export const createOrder = async (req, res) => {
  try {
    const { products, totalAmount } = req.body;
    const userId = req.user.id;

    const order = new Order({ user: userId, products, totalAmount });
    await order.save();

    res.status(201).json(order);
  } catch (error) {
    res.status(500).json({ error: "Error creating order" });
  }
};

// ✅ Get User Orders
export const getUserOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user.id }).populate("products.product");
    res.status(200).json(orders);
  } catch (error) {
    res.status(500).json({ error: "Error fetching orders" });
  }
};
