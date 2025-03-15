import PostModel from "../model/post.model.js";
import UserModel from "../model/user.model.js";
import NotificationModel from "../model/notification.model.js";
import CommentModel from "../model/comment.model.js";
import LikeModel from "../model/like.model.js";
import SavedPostModel from "../model/savedPost.model.js";
import InterestedPostModel from "../model/interestedPosts.model.js";
import NotInterestedPostModel from "../model/notInterestedPosts.model.js";
import ReportPostModel from "../model/reportPost.model.js";
import HideAllPostsModel from "../model/hideAllPost.model.js";
import BlockUserModel from "../model/blockList.model.js";
import cloudinary from "cloudinary";
import mongoose from "mongoose";
import FollowingModel from "../model/following.model.js";
import FriendModel from "../model/friends.model.js";
import FriendModel2 from "../model/friends2.model.js";

export const getAllPost = async (req, res, next) => {
  try {
    // const celebrityAccounts = await UserModel.find({ followingCount: { $gt: 200 } }).select("_id");
    // const celebrityIds = celebrityAccounts.map(e => e._id);
    // const allPosts = await PostModel.find({ $or: [{ userId: { $in: req.user.following } }, { userId: { $in: req.user.friends } }, { userId: { $in: celebrityIds } }] }).sort({ createdAt: -1 });
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const userId = req.user._id;
    const user = req.user;
    const [myBlockedDocuments, hidePosts, following, friends, friends2, reportedPosts, notInterestedPosts] = await Promise.all([
      BlockUserModel.find({ userId }, { blockedUserId: 1, _id: 0 }).lean(),
      HideAllPostsModel.find({ userId }, { hideUserId: 1, _id: 0 }).lean(),
      FollowingModel.find({ userId }, { followingId: 1, _id: 0 }).lean(),
      FriendModel.find({ userId }, { friendId: 1, _id: 0 }).lean(),
      FriendModel2.find({ userId }, { friendId: 1, _id: 0 }).lean(),
      ReportPostModel.find({ userId }, { postId: 1, _id: 0 }).lean(),
      NotInterestedPostModel.find({ userId }, { postId: 1, _id: 0 }).lean(),
    ]);
    const myBlockList = myBlockedDocuments.map((e) => e.blockedUserId);
    const hidesUserIds = hidePosts.map((e) => e.hideUserId);
    const followingIds = following.map((e) => e.followingId);
    const friendsIds = friends.map((e) => e.friendId);
    const friendsIds2 = friends2.map((e) => e.friendId);
    const reportedPostsIds = reportedPosts.map((e) => e.postId);
    const notInterestedPostsIds = notInterestedPosts.map((e) => e.postId);

    const allFriendsIds = [...new Set([...friendsIds, ...friendsIds2])];

    const allPosts = await PostModel.find({
      audience: { $ne: "Only me" },
      userId: { $nin: [...myBlockList, ...hidesUserIds, req.user._id], $in: [...followingIds, ...allFriendsIds] },
      _id: { $nin: [...reportedPostsIds, ...notInterestedPostsIds] },
    })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    const allIds = allPosts.map((e) => e._id);
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
    await PostModel.updateMany({ _id: { $in: allIds } }, { $inc: { views: 1 } });
    if (!allPosts) return res.status(400).json({ message: "No posts found" });
    return res.status(200).json({ allPosts, likedData });
  } catch (error) {
    console.log(`Error in getting posts: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const myRecentPost = async (req, res, next) => {
  try {
    const user = req.user;
    const { AllPostsIds } = req.body;
    const recentPost = await PostModel.findOne({ userId: user._id }).sort({ createdAt: -1 });
    if (!recentPost) return res.status(400).json({ message: "No posts found" });
    AllPostsIds.push(recentPost._id);
    const ids = AllPostsIds.map((e) => new mongoose.Types.ObjectId(e));
    const likedData = await LikeModel.aggregate([
      {
        $match: {
          postId: { $in: ids },
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
    return res.status(200).json({ recentPost, likedData });
  } catch (error) {
    console.log(`Error in getting posts: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getCurrentUserPost = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { userId } = req.params;
    const { limit = 50, page = 1 } = req.query;
    const skip = (page - 1) * limit;
    const userPosts = await PostModel.find({ userId: userId }).sort({ createdAt: -1 }).skip(skip).limit(limit);
    const allIds = userPosts.map((e) => e._id);
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
    await PostModel.updateMany({ _id: { $in: allIds } }, { $inc: { views: 1 } });

    if (userPosts) {
      return res.status(200).json({ posts: userPosts, likedData });
    } else {
      return res.status(400).json({ message: "No posts found" });
    }
  } catch (error) {
    console.log(`Error in getting posts: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getPost = async (req, res, next) => {
  try {
    const { postId } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(postId);
    if (!isValid) return res.status(400).json({ message: "Invalid post id" });
    const userPost = await PostModel.findOne({ _id: postId });
    if (userPost) {
      return res.status(200).json({ post: userPost });
    } else {
      return res.status(400).json({ message: "No posts found" });
    }
  } catch (error) {
    console.log(`Error in getting post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const savePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const isPostExist = await PostModel.findOne({ _id: postId });
    if (!isPostExist) return res.status(404).json({ message: "Post not found" });
    const savePost = await SavedPostModel.updateOne({ userId: user._id, postId: postId }, { $set: { userId: user._id, postId: postId } }, { upsert: true });

    if (savePost.upsertedCount > 0) {
      return res.status(201).json({ message: "Post added to saved list" });
    } else if (savePost.matchedCount) {
      return res.status(200).json({ message: "Post already saved" });
    } else {
      return res.status(404).json({ message: "Unable to save post" });
    }
  } catch (error) {
    console.log(`Error in saved posts`, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const interestedPost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const isPostExist = await PostModel.findOne({ _id: postId });
    if (!isPostExist) return res.status(404).json({ message: "Post not found" });
    const interestedPostEntry = await InterestedPostModel.create({ userId: user._id, postId: postId });
    if (interestedPostEntry) {
      return res.status(201).json({ message: "Interested" });
    }
    throw new Error("Unable to create interested post");
  } catch (error) {
    console.log(`Error in interested posts`, error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Interested" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const notInterestedPost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const isPostExist = await PostModel.findOne({ _id: postId });
    if (!isPostExist) return res.status(404).json({ message: "Post not found" });
    const notInterestedPostEntry = await NotInterestedPostModel.create({ userId: user._id, postId: postId });
    if (notInterestedPostEntry) {
      return res.status(201).json({ message: "Not Interested" });
    }
    throw new Error("Unable to create not interested post");
  } catch (error) {
    console.log(`Error in not interested posts`, error);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Not Interested" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getThisUserPostPhotos = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { userId } = req.params;
    const userPosts = await PostModel.find({ userId, image: { $not: { $size: 0 } } })
      .select("image")
      .sort({ createdAt: -1 });
    const allPhotos = userPosts.map((post) => post.image);
    const flattenedArray = allPhotos.flat(Infinity);
    if (flattenedArray.length > 0) {
      return res.status(200).json({ posts: flattenedArray });
    } else {
      return res.status(200).json({ message: "No posts found", posts: [] });
    }
  } catch (error) {
    console.log(`Error in getting posts_photos: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getThisUserPostVideos = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { userId } = req.params;
    const userPosts = await PostModel.find({ userId, video: { $not: { $size: 0 } } })
      .select("video")
      .sort({ createdAt: -1 });
    const allvideos = userPosts.map((post) => post.video);
    const flattenedArray = allvideos.flat(Infinity);
    if (flattenedArray.length > 0) {
      return res.status(200).json({ posts: flattenedArray });
    } else {
      return res.status(200).json({ message: "No videos found", posts: [] });
    }
  } catch (error) {
    console.log(`Error in getting posts_videos: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const createPost = async (req, res, next) => {
  try {
    const uploadPromises = req.files.map(async (file) => {
      const result = await cloudinary.uploader.upload(file.path, {
        upload_preset: "ml_default",
      });
      // fs.unlinkSync(file.path);
      if (result && result.secure_url) {
        return result.secure_url;
      } else {
        throw new Error(`Error in uploading image`);
      }
    });
    const urls = await Promise.all(uploadPromises);
    const currentUser = req.user;
    const { text = "", audience = "Everyone", type = "post", question = "", option1 = "", option2 = "" } = req.body;
    if (type === "poll") {
      if (!question || !option1 || !option2) {
        return res.status(400).json({ error: "A poll must have a question and 2 options." });
      }
    }
    const post = await PostModel.create({
      userId: currentUser._id,
      postCreator: currentUser.name,
      creatorProfilePic: currentUser.profilePic,
      postTextContent: text,
      image: urls || [],
      question,
      option1,
      option2,
      commentCount: 0,
      views: 0,
      audience,
      type,
    });
    if (post) {
      return res.status(201).json({ post, sucess: true });
    } else {
      console.log(`Error in creating post: ${error}`);
      return res.status(500).json({ message: "Internal server error", sucess: false });
    }
  } catch (error) {
    console.log(`Error in creating post: ${error.message}`);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
export const createPostWithVideo = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { text, audience } = req.body;
    const creatorProfilePic = currentUser.profilePic;

    const post = await PostModel.create({
      postCreator: currentUser.name,
      userId: currentUser._id,
      postTextContent: text,
      image: [],
      video: req.videoURL,
      commentCount: 0,
      views: 0,
      audience,
      creatorProfilePic,
    });

    if (post) {
      return res.status(200).json({ post });
    } else {
      console.log(`Error in creating post: ${error}`);
      return res.status(500).json({ message: "Internal server error" });
    }
  } catch (error) {
    console.log(`Error in creating post: ${error.message}`);
    return res.status(500).json({ message: "Internal server error", error });
  }
};
export const updatePost = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text, isMedia, audience } = req.body;
    const hasAuthority = await PostModel.findOne({ _id: postId, userId: userId });
    if (hasAuthority) {
      const uploadPromises = req.files.map(async (file) => {
        const isVideo = file.mimetype.includes("video");
        const resourcetype = isVideo ? "video" : "image";
        const result = await cloudinary.uploader.upload(file.path, {
          upload_preset: "ml_default",
        });
        // fs.unlinkSync(file.path);
        if (result && result.secure_url) {
          return result.secure_url;
        } else {
          throw new Error(`Error in uploading image`);
        }
      });
      const urls = await Promise.all(uploadPromises);
      if (urls.length > 0) {
        const update = await PostModel.updateOne({ _id: postId }, { $set: { postTextContent: text, video: [], image: urls, audience } });
        if (update.modifiedCount > 0) {
          return res.status(200).json({ message: `Post updated successfully` });
        }
      } else {
        if (isMedia === "No media") {
          const update = await PostModel.updateOne({ _id: postId }, { $set: { postTextContent: text, video: [], image: [], audience } });
          if (update.modifiedCount > 0) {
            return res.status(200).json({ message: `Post updated successfully` });
          } else {
            throw new Error(`Error in updating post`);
          }
        }
        const update = await PostModel.updateOne({ _id: postId }, { $set: { postTextContent: text, audience } });
        if (update.modifiedCount > 0) {
          return res.status(200).json({ message: `Post updated successfully` });
        } else {
          throw new Error(`Error in updating post`);
        }
      }
    } else {
      console.log("No Permission");
      return res.status(403).json({ message: "You are not authorized to update the post" });
    }
  } catch (error) {
    console.log(`Error in updating post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const voteOnPoll = async (req, res, next) => {
  try {
    const { postId, userId } = req.params;
    const { option } = req.body;
    if (!postId || !userId) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const found = await PostModel.findById(postId);
    if (!found) {
      return res.status(404).json({ message: "Poll not found" });
    }
    if (found.type !== "poll") {
      return res.status(400).json({ message: "This is not a poll" });
    }
    const index = found.voters.findIndex((voter) => voter.userId.toString() === userId.toString());
    if (index < 0) {
      found.voters.push({ userId, vote: option });
      if (option === "option1") {
        found.votesOnOption1 += 1;
      } else if (option === "option2") {
        found.votesOnOption2 += 1;
      }
      found.totalVotes += 1;
      await found.save();
      return res.status(200).json({ success: true, poll: found });
    }
    if (index >= 0) {
      const prevVote = found.voters[index].vote;
      if (prevVote !== option) {
        if (prevVote === "option1") {
          found.votesOnOption1 -= 1;
        } else if (prevVote === "option2") {
          found.votesOnOption2 -= 1;
        }
        if (option === "option1") {
          found.votesOnOption1 += 1;
        } else if (option === "option2") {
          found.votesOnOption2 += 1;
        }
        found.voters[index].vote = option;
        await found.save();
        return res.status(200).json({ success: true, poll: found });
      } else if (prevVote === option) {
        if (prevVote === "option1") {
          found.votesOnOption1 -= 1;
        } else if (prevVote === "option2") {
          found.votesOnOption2 -= 1;
        }
        found.totalVotes -= 1;
        found.voters.splice(index, 1);
        await found.save();
        return res.status(200).json({ success: true, poll: found });
      }
    }
  } catch (error) {
    console.log(`Error in voting poll: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updatePostVideoNoMediaChange = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text, audience } = req.body;
    const hasAuthority = await PostModel.findOne({ _id: postId, userId: userId });
    if (hasAuthority) {
      const update = await PostModel.updateOne({ _id: postId }, { $set: { postTextContent: text, audience } });
      if (update.modifiedCount > 0) {
        return res.status(200).json({ message: `Post updated successfully` });
      }
    } else {
      return res.status(400).json({ message: "You are not authorized to update the post" });
    }
  } catch (error) {
    console.log(`Error in updating post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updatePostWithVideo = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { postId } = req.params;
    const { text, isMedia, audience } = req.body;
    const hasAuthority = await PostModel.findOne({ _id: postId, userId: userId });
    if (hasAuthority) {
      const urls = req.videoURL;
      if (urls) {
        const update = await PostModel.updateOne({ _id: postId }, { $set: { postTextContent: text, image: [], video: urls, audience } });
        if (update.modifiedCount > 0) {
          return res.status(200).json({ message: `Post updated successfully` });
        }
      } else {
        if (isMedia === "No media") {
          const update = await PostModel.updateOne({ _id: postId }, { $set: { postTextContent: text, video: [], image: [], audience } });
          if (update.modifiedCount > 0) {
            return res.status(200).json({ message: `Post updated successfully` });
          } else {
            throw new Error(`Error in updating post`);
          }
        }
      }
    } else {
      return res.status(400).json({ message: "You are not authorized to update the post" });
    }
  } catch (error) {
    console.log(`Error in updating post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const pinPost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;
    const hasAuthority = await PostModel.findOne({ _id: postId, userId: userId });
    if (hasAuthority) {
      const response = await UserModel.findOneAndUpdate({ _id: userId }, { $set: { pinnedPost: postId } }, { new: true });
      if (response) {
        return res.status(200).json({ message: `Post pinned successfully`, response });
      } else {
        throw new Error("Error in pinning post");
      }
    }
  } catch (error) {
    console.log(`Error in pinning post: `, error);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateUserNameOfPost = async (req, res, next) => {
  try {
    // const currentUser = req.user;
    // const postId = req.query.postId;
    const update = await PostModel.updateMany({ userId: req.user._id }, { $set: { postCreator: req.body.name } });
    if (update) {
      return res.status(200).json({ message: `Post updated successfully` });
    } else {
      throw new Error(`Error in updating post`);
    }
  } catch (error) {
    console.log(`Error in updating post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deletePost = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const userId = req.params.userId;
    const authorizedToDelete = await PostModel.findOne({ _id: postId, userId: userId });
    if (authorizedToDelete) {
      const deletePost = await PostModel.deleteOne({ _id: postId });
      await CommentModel.deleteMany({ postId: postId });
      if (deletePost.deletedCount > 0) {
        return res.status(200).json({ message: `Post deleted successfully` });
      } else {
        throw new Error(`Error in deleting post`);
      }
    } else {
      return res.status(403).json({ message: `You are not authorized to delete this post` });
    }
  } catch (error) {
    console.log(`Error in deleting post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const reportPost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const { reason } = req.body;
    const isPostExist = await PostModel.findById(postId);
    if (!isPostExist) return res.status(400).json({ message: `Post not found` });
    const reportPostEntry = await ReportPostModel.create({ postId, userId: user._id, reason: reason });
    if (reportPostEntry) {
      return res.status(200).json({ message: `Post reported` });
    }
    throw new Error(`Error in reporting post`);
  } catch (error) {
    console.log(`Error in reporting post: ${error}`);
    if (error.code === 11000) {
      return res.status(409).json({ message: "Post already reported" });
    }
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getSavedPosts = async (req, res, next) => {
  try {
    const user = req.user;
    const mySavedPosts = await SavedPostModel.find({ userId: user._id }).populate(
      "postId",
      "postCreator creatorProfilePic image userId likes views sharesCount audience commentCount postTextContent video createdAt"
    );
    if (mySavedPosts) {
      return res.status(200).json({ mySavedPosts });
    }
    throw new Error(`Error in getting saved posts`);
  } catch (error) {
    console.log(`Error in getting saved posts: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const unSavePost = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;
    const isPostExist = await PostModel.findById(postId);
    if (!isPostExist) return res.status(400).json({ message: `Post not found` });
    const unSavePostEntry = await SavedPostModel.deleteOne({ userId: user._id, postId: postId });
    if (unSavePostEntry.deletedCount > 0) {
      return res.status(200).json({ message: `Post unsaved` });
    }
    throw new Error(`Error in unsaving post`);
  } catch (error) {
    console.log(`Error in unsaving post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

// work start here
export const hideAllPosts = async (req, res, next) => {
  try {
    const user = req.user;
    const { userId } = req.params;
    const isUserExist = await UserModel.findById(userId);
    if (!isUserExist) return res.status(400).json({ message: `User not found` });
    const hideUserIdEntry = await HideAllPostsModel.create({ userId: user._id, hideUserId: userId });
    if (hideUserIdEntry) {
      return res.status(200).json({ message: `User hidden` });
    }
    throw new Error(`Error in hiding user`);
  } catch (error) {
    console.log(`Error in hiding user: ${error}`);
    if (error.code === 11000) {
      return res.status(409).json({ message: "User already hidden" });
    } else {
      return res.status(500).json({ message: "Internal server error" });
    }
  }
};
export const likes = async (req, res, next) => {
  try {
    const currentUser = req.user;
    let { postId } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(postId);
    if (!isValid) return res.status(400).json({ message: `Invalid post id` });
    const foundPost = await PostModel.findById(postId);
    if (!foundPost) {
      return res.status(400).json({ message: `Post not found` });
    }
    const existingLike = await LikeModel.findOne({ postId, userId: currentUser._id });
    if (existingLike) {
      await LikeModel.deleteOne({ postId, userId: currentUser._id });
      foundPost.likes -= 1;
      await foundPost.save();
      return res.status(200).json({ likesCount: foundPost.likes, message: `Like removed` });
    } else {
      const newLike = await LikeModel.create({ postId, userId: currentUser._id });
      foundPost.likes += 1;
      await foundPost.save();
      return res.status(200).json({ likesCount: foundPost.likes, message: "Liked" });
    }
  } catch (error) {
    console.log(`Error in updating likes: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateShareCount = async (req, res, next) => {
  try {
    let { postId } = req.params;
    const isValid = mongoose.Types.ObjectId.isValid(postId);
    if (!isValid) return res.status(400).json({ message: `Invalid post id` });

    const updatedPost = await PostModel.findByIdAndUpdate(postId, { $inc: { sharesCount: 1 } }, { new: true });

    if (!updatedPost) {
      return res.status(404).json({ message: "Post not found" });
    }
    return res.status(200).json({ success: true });
  } catch (error) {
    console.log(`Error in updating share count: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const isLiked = async (req, res, next) => {
  try {
    const user = req.user;
    const { postId } = req.params;

    const isLiked = await LikeModel.findOne({ postId, userId: user._id });
    if (isLiked) {
      return res.status(200).json({ Liked: true });
    } else {
      return res.status(200).json({ Liked: false });
    }
  } catch (error) {
    console.log(`Error in isLiked`);
    return res.status(500).json({ Message: "Internal server error" });
  }
};
export const shares = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const postId = req.query.postId;
    const postCreator = await UserModel.findOne({ posts: { $in: postId } }).select("_id");
    const updated = await UserModel.updateOne({ _id: currentUser._id }, { $push: { sharedPosts: postId, posts: postId } });
    if (updated.modifiedCount > 0) {
      const notified = await NotificationModel.create({
        recipient: postCreator,
        sender: currentUser._id,
        type: "shares",
        content: `${currentUser.name} has shared your post.`,
        relatedPost: postId,
        read: false,
      });

      if (notified) {
        return res.status(200).json({ shares: updated.sharedPosts.length });
      } else {
        console.log(`Error in sending notification.`);
        return res.status(200).json({ shares: updated.sharedPosts.length, message: `Post shared, but notification not sent` });
      }
    } else {
      throw new Error(`Error in sharing post`);
    }
  } catch (error) {
    console.log(`Error in sharing post: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const getComment = async (req, res, next) => {
  try {
    const postId = req.params.postId;
    const getComments = await CommentModel.find({ postId }).sort({ createdAt: -1 });
    if (!getComments) {
      return res.status(400).json({ message: "Post not found" });
    }
    return res.status(200).json({ comments: getComments });
  } catch (error) {
    console.log(`Error in getting comment: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const createComment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { content, creatorProfilePic, creatorName, creatorId, postCreatorId } = req.body;
    const { postId } = req.params;
    if (!postId || !creatorId) {
      return res.status(400).json({ message: "Post not found" });
    }

    // const getPost = await PostModel.findById(postId);

    const addComment = await CommentModel.create({
      content,
      postId,
      media: [],
      creatorProfilePic,
      creatorName,
      creatorId,
      postCreatorId,
    });
    if (!addComment) {
      return res.status(404).json({ message: "Comment not created!" });
    }
    if (addComment) {
      // const notified = await NotificationModel.create({
      //     recipient: getPost.userId,
      //     sender: currentUser._id,
      //     type: "comment",
      //     content: `${currentUser.name} has commented on your post.`,
      //     relatedPost: postId,
      //     read: false
      // })
      // getPost.comments.push({ content, currentUserId });

      const allComments = await CommentModel.find({ postId }).sort({ createdAt: -1 }).limit(20);
      await PostModel.updateOne({ _id: postId }, { $inc: { commentCount: 1 } });
      return res.status(200).json({ allComments });
    } else {
      throw new Error(`Error in adding comment`);
    }
  } catch (error) {
    console.log(`Error in adding comment: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const updateComment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const currentUserId = currentUser._id;
    const content = req.body.content;
    const postId = req.params.postId;
    const id = req.params.id;
    const updateComment = await CommentModel.updateOne({ _id: id }, { $set: { content } });
    if (!updateComment) {
      return res.status(400).json({ message: "Comment not found" });
    }

    if (updateComment.modifiedCount > 0) {
      const allComments = await CommentModel.find({ postId }).sort({ createdAt: -1 }).limit(20);
      return res.status(200).json({ message: "Comment added successfully", allComments });
    } else {
      throw new Error(`Error in updating comment`);
    }
  } catch (error) {
    console.log(`Error in adding comment: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
export const deleteComment = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const id = req.params.id;
    const postId = req.params.postId;
    const getComment = await CommentModel.deleteOne({ _id: id });
    if (!getComment) {
      return res.status(400).json({ message: "Comment not found" });
    }
    if (getComment.deletedCount > 0) {
      // const allComments = await CommentModel.find({ postId }).sort({ createdAt: -1 }).limit(20);
      await PostModel.updateOne({ _id: postId }, { $inc: { commentCount: -1 } });
      return res.status(200).json({ message: "Comment deleted successfully" });
    } else {
      throw new Error(`Error in deleting comment`);
    }
  } catch (error) {
    console.log(`Error in adding comment: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};
