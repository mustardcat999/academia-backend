import express from "express";
import authenticateUser from "../middleware/auth.js";
const router = express.Router();
import {
  createJobDrive,
  getJobDrives,
  getJobDriveById,
  updateJobDrive,
  deleteJobDrive,
  getAppliedStudentForJob,
} from "../controller/jobDriveController.js";

/**
 * @desc Register a new jobDrive
 * @route POST /api/v1/jobDrive/create
 * @access Private
 */
router.route("/create").post(authenticateUser, createJobDrive);

/**
 * @desc Get All jobDrive
 * @route GET /api/v1/jobDrive/all
 * @access Private
 */
router.route("/all").get(authenticateUser, getJobDrives);

/**
 * @desc Get jobDrive by ID
 * @route GET /api/v1/jobDrive/:jobDriveId
 * @access Private
 */
router.route("/:jobDriveId").get(authenticateUser, getJobDriveById);

/**
 * @desc Update a jobDrive
 * @route POST /api/v1/jobDrive/edit/:jobDriveId
 * @access Private
 */
router.route("/edit/:jobDriveId").patch(authenticateUser, updateJobDrive);

/**
 * @desc Delete a jobDrive
 * @route POST /api/v1/jobDrive/delete/:id
 * @access Private
 */
router.route("/delete/:jobDriveId").delete(authenticateUser, deleteJobDrive);

/**
 * @desc Get Applied student in jobDrive by id
 * @route GET /api/v1/jobDrive/getAppliedStudent/:jobDriveId
 * @access Private
 */
router
  .route("/getAppliedStudent/:jobDriveId")
  .get(authenticateUser, getAppliedStudentForJob);

export default router;
