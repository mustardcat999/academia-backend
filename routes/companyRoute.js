// import express module
import express from "express";

// import authentication middleware
import authenticateUser from "../middleware/auth.js";

// create router object
const router = express.Router();

// import controller functions
import {
  actionForStudentForJobDrive,
  createJobDrive,
  deleteJobDrive,
  getCompanyById,
  getJobDrive,
  getJobDriveById,
  getStats,
  getStudentById,
  updateCompanyById,
  updateJobDrive,
} from "../controller/companyController.js";
import { getStudentByIdInCSV } from "../controller/companyController.js";

/**
 * @desc Get Company by ID
 * @route GET /api/v1/company/:companyId
 * @route PATCH /api/v1/company/:companyId
 * @access Private
 */
router.route("/stats").get(authenticateUser, getStats);

/**
 * @desc Create a new job drive
 * @desc Get all job drives
 * @route GET,POST /api/v1/company/job
 * @access Private
 * */
router
  .route("/job")
  .post(authenticateUser, createJobDrive)
  .get(authenticateUser, getJobDrive);

/**
 * @desc Get Company by ID
 * @desc Update Company by ID
 * @route GET, PATCH /api/v1/company/:companyId
 * @access Private
 */
router
  .route("/:companyId")
  .get(authenticateUser, getCompanyById)
  .patch(authenticateUser, updateCompanyById);

/**
 * @desc Get Job Drive by ID
 * @desc Update Job Drive by ID
 * @desc Delete Job Drive by ID
 * @route GET, PATCH, DELETE /api/v1/company/job/:jobId
 * @access Private
 * */
router
  .route("/job/:jobId")
  .get(authenticateUser, getJobDriveById)
  .patch(authenticateUser, updateJobDrive)
  .delete(authenticateUser, deleteJobDrive);
  
/**
 * @desc Update action for student for job drive
 * @route PATCH /api/v1/company/action/:studentId
 * @access Private
 */
router.route("/action/:studentId").patch(authenticateUser, actionForStudentForJobDrive);

/**
 * @desc Get student by id
 * @route GET /api/v1/company/student/:studentId
 * @access Private
 * */
router.route("/student/:studentId").get(authenticateUser, getStudentById);

/**
 * @desc Get student by id in csv format
 * @route POST /api/v1/company/csv
 * @access Private
 */
router.route("/csv").post(authenticateUser, getStudentByIdInCSV);

// export router object
export default router;