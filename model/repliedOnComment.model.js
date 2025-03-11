import mongoose from "mongoose";

const RepliedOnCommentSchema = new mongoose.Schema({
    commentIdOfMainComment: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    replyCommentCreatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    replyCommentCreatorName: {
        type: String,
        required: true
    },
    replyCommentCreatorProfilePic: {
        type: String,
        required: true
    }
}, {timestamp: true});

RepliedOnCommentSchema.index({commentIdOfMainComment: 1}, {unique: true})

const RepliedOnCommentModel = mongoose.model("RepliedOnComment", RepliedOnCommentSchema);
export default RepliedOnCommentModel;
