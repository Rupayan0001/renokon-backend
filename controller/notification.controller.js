import NotificationModel from "../model/notification.model.js";

export const getNotifications = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const notifications = await NotificationModel.find({ recipient: currentUser._id }).sort({ createdAt: -1 });
    if (notifications) {
      return res.status(200).json({ notifications });
    }
    throw new Error(`Error in getting notifications`);
  } catch (error) {
    console.log(`Error in getting notifications: ${error}`);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export const deleteAllNotification = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const deleted = await NotificationModel.deleteMany({ recipient: currentUser._id });
    if (deleted.deletedCount > 0) {
      return res.status(200).json({ message: "Notification deleted successfully", success: true });
    } else {
      return res.status(404).json({ message: "No notifications found", success: false });
    }
  } catch (error) {
    console.log(`Error in getting notifications: ${error}`);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
export const deleteSpecificNotification = async (req, res, next) => {
  try {
    const currentUser = req.user;
    const { id } = req.params;
    const deleted = await NotificationModel.deleteOne({ _id: id, recipient: currentUser._id });
    if (deleted.deletedCount > 0) {
      return res.status(200).json({ message: "Notification deleted successfully", success: true });
    } else {
      return res.status(404).json({ message: "No notifications found", success: false });
    }
  } catch (error) {
    console.log(`Error in getting notifications: ${error}`);
    return res.status(500).json({ message: "Internal server error", success: false });
  }
};
