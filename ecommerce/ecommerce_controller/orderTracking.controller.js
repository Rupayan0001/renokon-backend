import Order from "../models/Order.js";
import axios from "axios";

// ✅ Update Order Status (Admin)
export const updateOrderStatus = async (req, res) => {
  try {
    const { orderId, status } = req.body;

    const validStatuses = ["Pending", "Shipped", "Out for Delivery", "Delivered"];
    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: "Invalid order status" });
    }

    await Order.findByIdAndUpdate(orderId, { status });
    res.status(200).json({ message: "Order status updated" });
  } catch (error) {
    res.status(500).json({ error: "Error updating order status" });
  }
};

export const optimizeRoute = async (warehouse, customerLocation) => {
  const { data } = await axios.get(`https://maps.googleapis.com/maps/api/directions/json`, {
    params: {
      origin: warehouse.location,
      destination: customerLocation,
      key: process.env.GOOGLE_MAPS_API_KEY,
    },
  });

  return data.routes[0].legs[0].duration.text;
};

export const processOrder = async (req, res) => {
  const { warehouseId, customerLocation } = req.body;

  const deliveryTime = await optimizeRoute(warehouseId, customerLocation);
  res.status(200).json({ message: `Estimated delivery time: ${deliveryTime}` });
};
