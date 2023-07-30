import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import UnAuthenticatedError from "../errors/unauthenticated.js";
import Admin from "../models/admin.js";
const authAdmin = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    console.error("Authentication invalid");
    res
      .status(StatusCodes.UNAUTHORIZED)
      .json({ message: "Authentication invalid" });
    return;
  }

  const token = authHeader.split(" ")[1];

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Admin.findOne({ _id: payload.userId });

    if (!user) {
      throw new UnAuthenticatedError("Invalid user");
    }

    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    console.error(error.message);
    res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    return;
  }
};

export default authAdmin;
