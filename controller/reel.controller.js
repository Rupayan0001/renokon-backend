import ReelsModel from "../model/reels.model.js";
import LikeModel from "../model/like.model.js";
import CommentModel from "../model/comment.model.js";
import ProductModel from "../model/ecommerce_model/product.model.js";
import mongoose from "mongoose";
export const createReel = async (req, res) => {
  try {
    const user = req.user;
    const { link } = req.body;
    let productLink = "";
    let productImage = "";
    let productTitle = "";
    const title = req.body.title || "";
    if (link) {
      let idNumber = link.split("/").at(-1);
      const product = await ProductModel.findOne({ _id: idNumber });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      productLink = idNumber;
      productImage = product.image[0];
      productTitle = product.title;
    }
    const reel = await ReelsModel.create({ userId: user._id, videoLink: req.videoURL, title, productLink, productImage, productTitle });
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
    const { id } = req.params;
    const { page = 1 } = req.query;
    const limit = 20;
    const skip = (page - 1) * limit;
    let reels;
    if (id && id !== "undefined") {
      const foundReel = await ReelsModel.findOne({ _id: id, videoLink: { $exists: true, $ne: "" } });
      reels = await ReelsModel.find({ videoLink: { $exists: true, $ne: "" } })
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });
      reels[0] = foundReel;
    } else {
      reels = await ReelsModel.find({ videoLink: { $exists: true, $ne: "" } }).sort({ createdAt: -1 });
    }

    const allIds = reels.map((e) => e._id);
    const likedData = await LikeModel.aggregate([
      {
        $match: {
          postId: { $in: allIds },
        },
      },
      {
        $group: {
          _id: "$postId",
          totalLikes: { $sum: 1 },
          usersLiked: { $addToSet: "$userId" },
        },
      },
      {
        $project: {
          postId: "$_id",
          totalLikes: 1,
          userLiked: { $in: [req.user._id, "$usersLiked"] },
        },
      },
    ]);
    res.status(200).json({ reels, likedData });
    await ReelsModel.updateMany({ _id: { $in: allIds } }, { $inc: { views: 1 } });
    return;
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

export const likes = async (req, res, next) => {
  try {
    const currentUser = req.user;
    let { postId } = req.params;
    console.log(postId);
    if (!postId) return res.status(400).json({ message: `No post id provided` });
    const foundReel = await ReelsModel.findById({ _id: postId });
    if (!foundReel) {
      return res.status(404).json({ message: `Reel not found` });
    }
    const existingLike = await LikeModel.findOne({ postId, userId: currentUser._id });
    if (existingLike) {
      await LikeModel.deleteOne({ postId, userId: currentUser._id });
      foundReel.likes -= 1;
      await foundReel.save();
      return res.status(200).json({ message: `Like removed` });
    } else {
      const newLike = await LikeModel.create({ postId, userId: currentUser._id });
      foundReel.likes += 1;
      await foundReel.save();
      return res.status(200).json({ message: "Liked" });
    }
  } catch (error) {
    console.log(`Error in updating likes: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const getComment = async (req, res, next) => {
  try {
    const { reelId } = req.params;
    if (!reelId) return res.status(400).json({ message: `No reel id provided` });
    const getComments = await CommentModel.find({ reelId }).sort({ createdAt: -1 });
    if (!getComments) {
      return res.status(404).json({ message: "Reel not found" });
    }
    return res.status(200).json({ comments: getComments });
  } catch (error) {
    console.log(`Error in getting comment: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteComment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    // const id = req.params.id;
    const { postId, id } = req.params;
    const getComment = await CommentModel.deleteOne({ _id: id });
    if (!getComment) {
      return res.status(404).json({ message: "Comment not found" });
    }
    if (getComment.deletedCount > 0) {
      // const allComments = await CommentModel.find({ postId }).sort({ createdAt: -1 }).limit(20);
      await ReelsModel.updateOne({ _id: postId }, { $inc: { commentCount: -1 } });
      return res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      throw new Error(`Error in deleting comment`);
    }
  } catch (error) {
    console.log(`Error in adding comment: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
