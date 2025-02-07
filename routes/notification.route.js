import express from "express";
import { auth } from "../middleware/auth.js";
const router = express.Router();
import { getNotifications, deleteAllNotification, deleteSpecificNotification } from "../controller/notification.controller.js";

router.use(auth);

router.get("/getNotifications", getNotifications);
router.delete("/deleteNotification", deleteAllNotification);
router.delete("/deleteSpecificNotification/:id", deleteSpecificNotification);

export default router;
