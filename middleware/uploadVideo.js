import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

// cloudinary_email= "rupayan.team@gmail.com "
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME_2,
  api_key: process.env.CLOUDINARY_API_KEY_2,
  api_secret: process.env.CLOUDINARY_API_SECRET_2,
});
// cloudinary.config({
//   cloud_name: "dnku8pwjp",
//   api_key: 171519932449455,
//   api_secret: "0r92XneXSr5K3oK0e6tHn_4CAlo",
// });

async function uploadVideo(req, res, next) {
  try {
    if (!req.file) {
      req.videoURL = [];
      next();
    }
    if (!req.file.path) {
      req.videoURL = [];
      next();
    }
    const result = await cloudinary.uploader.upload(req.file.path, {
      resource_type: "video",
    });
    if (result) {
      req.videoURL = result.secure_url;
      fs.unlink(req.file.path, (err) => {
        if (err) {
          console.error("Error deleting file:", err);
        } else {
          console.log("Invalid video deleted successfully.");
        }
      });
      return next();
    }
  } catch (error) {
    req.videoURL = [];
    console.log(error);
  }
}
export default uploadVideo;
