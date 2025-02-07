import mongoose from "mongoose";

const ReportPostSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    postId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    reason: {
        type: String,
        required: true
    }
})

ReportPostSchema.index({ userId: 1, postId: 1 }, { unique: true });
ReportPostSchema.index({ userId: 1 });
const ReportPostmodel = mongoose.model("ReportPost", ReportPostSchema);
export default ReportPostmodel;