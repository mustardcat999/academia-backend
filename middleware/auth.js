import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
const auth = async (req, res, next) => {
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
    // console.log(payload)
    // attach the user request object
    // req.user = payload
    console.log(payload);
    req.user = { userId: payload.userId };
    next();
  } catch (error) {
    console.error(error.message);
    res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    return;
  }
};

export default auth;
