import ReelsModel from "../model/reels.model.js";
import mongoose from "mongoose";
export const createReel = async (req, res) => {
  try {
    const user = req.user;
    const { title, description } = req.body;
    const reel = await ReelsModel.create({ userId: user._id, title, description, videoLink: req.videoURL });
    if (reel) {
      return res.status(200).json({ reel, message: "Reel uploaded successfully" });
    }
    return res.status(400).json({ message: "Unable to create reel" });
  } catch (error) {
    console.log(`Error in creating reel: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getReels = async (req, res) => {
  try {
    const reels = await ReelsModel.find({ videoLink: { $exists: true, $ne: "" } });
    return res.status(200).json({ reels });
  } catch (error) {
    console.log(`Error in getting reels: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const updateShareCount = async (req, res, next) => {
  try {
    let { reelId } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(reelId);
    if (!isValid) return res.status(400).json({ message: `Invalid post id` });

    const updatedReels = await ReelsModel.updateOne({ _id: reelId }, { $inc: { shares: 1 } });

    if (updatedReels.modifiedCount <= 0) {
      return res.status(404).json({ message: "Reel not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(`Error in updating share count: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
