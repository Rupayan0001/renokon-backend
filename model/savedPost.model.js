import mongoose from "mongoose";

const SavedPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        index: true,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
        required: true
    }
}, { timestamps: true });

SavedPostSchema.index({ userId: 1, postId: 1 }, { unique: true })
SavedPostSchema.index({ userId: 1 })

const SavedPostmodel = mongoose.model("SavedPost", SavedPostSchema);
export default SavedPostmodel;