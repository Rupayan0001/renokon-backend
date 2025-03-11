import jwt from "jsonwebtoken";
import Usermodel from "../model/user.model.js";

export const auth = async (req, res, next) => {
  try {
    let token = req.cookies?.token || req.headers["authorization"]?.split(" ")[1];
    if (!token) {
      return res.status(401).json({ message: "You are not logged in" });
    }
    let decoded = null;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Session expired. Please log in again." });
      } else if (error.name === "JsonWebTokenError") {
        return res.status(401).json({ message: "Invalid token. Please log in again." });
      } else {
        console.error("JWT verification error:", error);
        return res.status(500).json({ message: "Internal server error. Please log in again." });
      }
    }
    const user = await Usermodel.findById(decoded.userId);
    if (!user) {
      return res.status(401).json({ message: "User no longer exists. Please log in again." });
    }
    req.user = user;
    next();
  } catch (err) {
    console.log("error in auth middleware ", err);
    return res.status(500).json({ message: `Internal server error, try again later` });
  }
};
