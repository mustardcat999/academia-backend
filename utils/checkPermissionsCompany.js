import { UnAuthenticatedError } from "../errors/index.js";
const checkPermissionsCompany = (requestUser, resourceUserId) => {
  console.log("requestUser", requestUser);
  console.log("resourceUserId", resourceUserId);
  if (requestUser.role === "admin") return;
  if (requestUser.userId === resourceUserId.toString()) return;
  throw new UnAuthenticatedError("Not authorized to access this route");
};

export default checkPermissionsCompany;
