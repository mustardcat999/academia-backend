import { StatusCodes } from "http-status-codes";
import jwt from "jsonwebtoken";
import UnAuthenticatedError from "../errors/unauthenticated.js";
import Company from "../../models/company.js";

const authCompany = async (req, res, next) => {
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
    const userId = payload.userId;

    // Check if the authenticated user is an admin
    const isAdmin = await Admin.exists({ _id: userId });
    if (isAdmin) {
      // If the user is an admin, attach the user to the request object and proceed to the next middleware
      req.user = { userId };
      next();
      return;
    }

    // Check if the authenticated user is a company user
    const company = await Company.findById(userId);
    if (company) {
      // If the user is a company user, attach the user to the request object and proceed to the next middleware
      req.user = { userId };
      next();
      return;
    }

    // If the authenticated user is not an admin or a company user, throw an UnAuthenticatedError
    throw new UnAuthenticatedError(
      "You are not authorized to access this resource"
    );
  } catch (error) {
    console.error(error.message);
    res.status(StatusCodes.UNAUTHORIZED).json({ message: error.message });
    return;
  }
};

export default authCompany;
