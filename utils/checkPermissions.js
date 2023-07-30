/*CHECK PERMISSION FUNCTION TO VERIFY WHETHER THE USER 
CALLING FOR THE REQUEST HAS ACCESS TO DO IT OR NOT*/
import Admin from "../models/admin.js";

const checkPermissions = async (requestUser, resourceUserId, next) => {
  console.log("requestUser", requestUser);
  const adminAccess = await Admin.findOne({ _id: requestUser.userId });
  console.log("adminAccess", adminAccess);
  if (adminAccess !== null) {
    return next();
  }
  if (requestUser.userId === resourceUserId.toString()) {
    return next();
  }
  const error = new Error("Not authorized to access this route");
  error.statusCode = 401;
  return next(error);
};

export default checkPermissions;
