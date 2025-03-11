import mongoose from "mongoose";
const cheatingSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  gamePoolId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Gamepool",
    required: true,
    index: true,
  },
  cheatingUserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    index: true,
  },
});

const CheatingModel = mongoose.model("Cheating", cheatingSchema);
export default CheatingModel;
