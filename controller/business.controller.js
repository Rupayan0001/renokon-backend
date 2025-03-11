import BusinessProfile from "../model/businessProfile.model.js";
import Admodel from "../model/ads.model.js";
import cloudinary from "../lib/cloudinary.js";
export const getProfile = async (req, res) => {
  try {
    const user = req.user;
    if (!user) return res.status(400).json({ message: "User id is required" });
    const businessProfile = await BusinessProfile.findOne({ userId: user._id });
    if (!businessProfile) return res.status(200).json({ message: "You don't have a business profile", noProfile: true });
    return res.status(200).json({ businessProfile, success: true });
  } catch (error) {
    console.log(`Error in getting business Profile: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const createProfile = async (req, res) => {
  try {
    const user = req.user;
    const { businessName, industry, website, email, phone, country, city, street, zipcode, products } = req.body;
    if ((!businessName || !industry || !email || !phone || !country || !city || !street || !zipcode, !products)) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const businessProfile = await BusinessProfile.create({ userId: user._id, businessName, industry, website, email, phone, country, city, street, zipcode, products });
    if (!businessProfile) return res.status(400).json({ message: "Error in creating business profile" });
    return res.status(200).json({ businessProfile, success: true });
  } catch (error) {
    console.log(`Error in creating business Profile: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const uploadProfileImages = async (req, res) => {
  try {
    const user = req.user;
    const { businessProfileId } = req.body;
    if (!businessProfileId) return res.status(400).json({ message: "Business profile id is required" });
    const businessProfile = await BusinessProfile.findById(businessProfileId);
    if (!businessProfile) return res.status(400).json({ message: "Business profile not found" });
    if (user._id.toString() !== businessProfile.userId.toString()) return res.status(400).json({ message: "You are not authorized to update this business profile" });
    const logoUrl = req.files.logo[0].path;
    const coverImageUrl = req.files.coverImage[0].path;

    const logoResult = await cloudinary.uploader.upload(logoUrl, { resource_type: "image" });
    const coverImageResult = await cloudinary.uploader.upload(coverImageUrl, { resource_type: "image" });

    businessProfile.logo = logoResult.secure_url;
    businessProfile.coverImage = coverImageResult.secure_url;
    await businessProfile.save();
    return res.status(200).json({ businessProfile, success: true });
  } catch (error) {
    console.log(`Error in uploading business Profile images: ${error}`);
    return res.status(500).json({ message: "Failed to upload images" });
  }
};
export const createAds = async (req, res) => {
  try {
    const user = req.user;
    const { businessProfileId, title, description, budget, duration, targetAudience, geoLocation, websiteURL, gender, ageGroup, device } = req.body;
    if (!businessProfileId) return res.status(400).json({ message: "Business profile id is required" });
    const businessProfile = await BusinessProfile.findById(businessProfileId);
    if (!businessProfile) return res.status(400).json({ message: "Business profile not found" });
    if (user._id.toString() !== businessProfile.userId.toString()) return res.status(403).json({ message: "You are not authorized to post ads for this account" });
    if (!req.file?.path) return res.status(400).json({ message: "Image is required" });
    const logoResult = await cloudinary.uploader.upload(req.file.path, { resource_type: "image" });
    if (!logoResult.secure_url) return res.status(500).json({ message: "Failed to upload images, please try again" });
    const ageArray = [];
    ageGroup.split("-").forEach((age) => {
      ageArray.push(parseInt(age));
    });
    const ad = await Admodel.create({
      userId: user._id,
      businessId: businessProfileId,
      title,
      description,
      budget,
      duration,
      targetAudience,
      geoLocation,
      websiteURL,
      gender,
      ageGroup: ageArray,
      device,
      image: logoResult.secure_url,
    });
    if (!ad) return res.status(500).json({ message: "Failed to create ad, please try again" });
    return res.status(200).json({ ad, success: true });
  } catch (error) {
    console.log(`Error in uploading business Profile images: ${error}`);
    return res.status(500).json({ message: "Failed to upload images" });
  }
};
