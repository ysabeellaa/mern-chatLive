import User from "../models/User.js";
import jwt from "jsonwebtoken";

//Protect routes
export const protectRoute = async (req,res, resizeBy, next) => {
  try {
    const token = req.headers.token;
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decodedToken.userId).select("-password");

    if (!user) return res.json({ success: false, message: "User not found 2" });
    req.user = user;
    next();
  } catch {
    res.json({ success: false, message: error.message });
    console.log(error.message);
  }
};
