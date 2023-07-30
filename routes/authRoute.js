import express from "express";
const router = express.Router();
import { changePassword, loginUser,forgotPassword } from "../controller/authController.js";

/**
 * @desc Login an existing user
 * @route POST /api/v1/auth/login
 * @access Public
 */
router.route("/login").post(loginUser);
/**
 * @desc Login an existing user
 * @route POST /api/v1/auth/forgotPassword
 * @access Public
 */
router.route("/forgotPassword").post(forgotPassword);

/**
 * @desc Change an user's password
 * @route PATCH /api/v1/auth/password
 * @access Private
 */
router.route("/password").patch(changePassword);
export default router;