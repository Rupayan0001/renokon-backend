import ReelsModel from "../model/reels.model.js";

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
