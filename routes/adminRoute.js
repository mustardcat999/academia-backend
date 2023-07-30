import express from "express"; // Importing express module
const router = express.Router(); // Creating a router instance
import {
  createAdmin, // Function to create an admin user
  updateAdmin, // Function to update an existing admin user's profile
  getAdminProfileDetails, // Function to get admin user's profile details
  createCompany, // Function to create a new company user
} from "../controller/adminAuthController.js"; // Importing functions from adminAuthController.js file
import {
  verifyJobDrive, // Function to verify job drive
  verifyStudent, // Function to verify student
  sendMailToGoogleGroups, // Function to send mails to google groups
  sendMessagesOnMail, // Function to send messages on mail
  getStudents, // Function to get students
  getStudentById, // Function to get student by id
  sendMailToSelectedStudent, // Function to send mail to selected student
  sendMailToUsers, // Function to send mail to users
  getCompany, // Function to get company
  getCompanyById, // Function to get company by id
  getJob, // Function to get job
  getJobById, // Function to get job by id
  getAppliedStudents, // Function to get applied students
  getStats, // Function to get stats
  getStudentByIdInCSV, // Function to get student by id in CSV
} from "../controller/adminFeaturesController.js"; // Importing functions from adminFeaturesController.js file

/**
 * @desc Update an existing admin user's profile
 * @route PATCH /api/v1/admin/profile
 * @route GET /api/v1/admin/profile
 * @access Private
 */
router.route("/profile").patch(updateAdmin).get(getAdminProfileDetails);
/**
 * Create a new admin user
 *
 * @route POST /api/v1/admin/createAdmin
 * @access Private
 */
router.route("/createAdmin").post(createAdmin);
/**
 * Create a new company user
 *
 * @route POST /api/v1/admin/createCompany
 * @access Private
 */
router.route("/createCompany").post(createCompany);

/**
 * Get students
 *
 * @route GET /api/v1/admin/students
 * @access Private
 */
router.route("/students").get(getStudents);

/**
 * Get student by id
 * @route GET /api/v1/admin/students/:studentId
 * @access Private
 * */
router.route("/students/:studentId").get(getStudentById);
/**
 * Get company
 *
 * @route GET /api/v1/admin/company
 * @access Private
 */
router.route("/company").get(getCompany);

/**
 * Get company by id
 * @route GET /api/v1/admin/company/:companyId
 * @access Private
 * */
router.route("/company/:companyId").get(getCompanyById);
/**
 * Get job
 *
 * @route GET /api/v1/admin/job
 * @access Private
 */
router.route("/job").get(getJob);

/**
 * Get job by id
 * @route GET /api/v1/admin/job/:jobId
 * @access Private
 * */
router.route("/job/:jobId").get(getJobById);

/**
 * Get applied students
 * @route GET /api/v1/admin/job/appliedBy/:jobId
 * @access Private
 * */
router.route("/job/appliedBy/:jobId").get(getAppliedStudents);

/**
 * Send mail to selected student
 * @route POST /api/v1/admin/sendMail/:studentId
 * @access Private
 * */
router.route("/sendMail/:studentId").post(sendMailToSelectedStudent);

/**
 * Send mail to selected student
 * @route POST /api/v1/admin/sendMail
 * @access Private
 * */
router.route("/sendMail").post(sendMailToUsers);

/**
 * Verify student
 * @route PATCH /api/v1/admin/verifyStudent/:studentId
 * @access Private
 * */
router.route("/verifyStudent/:studentId").patch(verifyStudent);

/**
 * Verify jobDrive
 * @route PATCH /api/v1/admin/verifyJobDrive/:jobDriveId
 * @access Private
 * */
router.route("/verifyJobDrive/:jobDriveId").patch(verifyJobDrive);

/**
 * Send mail to google groups
 * @route POST /api/v1/admin/sendMails/:jobDriveId
 * @access Private
 * */
router.route("/sendMails/:jobDriveId").post(sendMailToGoogleGroups);

/**
 * Send messages on mail
 * @route POST /api/v1/admin/sendMessagesOnMail
 * @access Private
 * */
router.route("/sendMessagesOnMail").post(sendMessagesOnMail);

/**
 * Get stats
 * @route GET /api/v1/admin/stats
 * @access Private
 * */
router.route("/stats").get(getStats);

/**
 * Get student by id in csv
 * @route POST /api/v1/admin/csv
 * @access Private
 * */
router.route("/csv").post(getStudentByIdInCSV);

export default router;
