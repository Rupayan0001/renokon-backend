import mongoose from "mongoose";

const LikeSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
}, {timestamps: true});

LikeSchema.index({ userId: 1, postId: 1 }, { unique: true })
const Likemodel = mongoose.model("like", LikeSchema);
export default Likemodel;