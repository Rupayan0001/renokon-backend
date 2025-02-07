import mongoose from "mongoose";

const HideAllPostsSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    hideUserId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        ref: "User"
    }
})
HideAllPostsSchema.index({ userId: 1, hideUserId: 1 }, { unique: true });
HideAllPostsSchema.index({ userId: 1 });
const HideAllPostsmodel = mongoose.model("HideAllPost", HideAllPostsSchema);
export default HideAllPostsmodel;