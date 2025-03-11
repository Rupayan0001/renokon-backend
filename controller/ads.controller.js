import Ad from "../models/Ad.js";

// ✅ Create a new ad
export const createAd = async (req, res) => {
  try {
    const { title, description, url, budget, targeting } = req.body;
    if (!title || !description || !url || !budget) {
      return res.status(400).json({ error: "All fields are required" });
    }

    let imageUrl = "";
    if (req.file && req.file.path) {
      const result = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
      imageUrl = result.secure_url;
    }

    const newAd = await Ad.create({
      advertiserId: req.user.id,
      title,
      description,
      image: imageUrl,
      url,
      budget,
      targeting,
    });

    res.status(201).json({ success: true, ad: newAd });
  } catch (error) {
    console.error("Error creating ad:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

// ✅ Fetch all ads for an advertiser
export const getAdsByUser = async (req, res) => {
  try {
    const ads = await Ad.find({ advertiserId: req.user.id });
    res.status(200).json({ success: true, ads });
  } catch (error) {
    res.status(500).json({ error: "Error fetching ads" });
  }
};

// ✅ Delete an ad
export const deleteAd = async (req, res) => {
  try {
    const { adId } = req.params;
    const ad = await Ad.findById(adId);
    if (!ad) return res.status(404).json({ error: "Ad not found" });

    if (ad.advertiserId.toString() !== req.user.id) {
      return res.status(403).json({ error: "Unauthorized to delete this ad" });
    }

    await ad.remove();
    res.status(200).json({ message: "Ad deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: "Error deleting ad" });
  }
};
