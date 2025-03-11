import Address from "../models/Address.js";

// ✅ Add Address
export const addAddress = async (req, res) => {
  try {
    const address = new Address({ user: req.user.id, ...req.body });

    if (req.body.default) {
      await Address.updateMany({ user: req.user.id }, { default: false });
    }

    await address.save();
    res.status(201).json(address);
  } catch (error) {
    res.status(500).json({ error: "Error adding address" });
  }
};

// ✅ Get Addresses
export const getAddresses = async (req, res) => {
  try {
    const addresses = await Address.find({ user: req.user.id });
    res.status(200).json(addresses);
  } catch (error) {
    res.status(500).json({ error: "Error fetching addresses" });
  }
};
