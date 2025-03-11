import mongoose from "mongoose";
const GroupSchema = new mongoose.Schema({
    groupName: {
        type: String,
        required: true
    },
    groupDescription: {
        type: String
    },
    groupAvatar: {
        type: String,
        default: null
    },
    groupCreatorId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    groupAdminId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    lastMessage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Message",
    },
    totalGroupMemberCount: {
        type: Number
    },
    groupMembersId: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    }]
})

// GroupSchema.createIndex({})
const Groupmodel = new mongoose.model("Group", GroupSchema);
export default Groupmodel;