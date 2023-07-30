import JobDrive from "../models/jobDrive.js";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import Admin from "../models/admin.js";
import Company from "../models/company.js";
import { StatusCodes } from "http-status-codes";
import Students from "../models/students.js";

/**
 * @desc Create jobDrive
 * @route POST /api/v1/jobDrive/create
 * @access Private
 */
const createJobDrive = async (req, res, next) => {
  try {
    const {
      designations,
      locations,
      streams,
      program,
      startDate,
      lastDate,
      eligibilityCriteria,
      driveDate,
      packageValue,
      description,
      pdfLink,
    } = req.body;
    if (
      !designations ||
      !locations ||
      !streams ||
      !program ||
      !startDate ||
      !lastDate ||
      !eligibilityCriteria ||
      !driveDate ||
      !packageValue ||
      !description ||
      !pdfLink
    ) {
      throw new BadRequestError("Please provide all the required fields");
    }
    const requester = req.user.userId;
    const ifAdmin = await Admin.findOne({ _id: requester });
    var ifCompany = await Company.findOne({ _id: req.body.company });
    if (ifAdmin) {
      if (!ifCompany) {
        throw new BadRequestError("Company not found");
      }
      req.body.createdBy = requester;
    } else {
      ifCompany = await Company.findOne({ _id: requester });
      if (ifCompany) {
        req.body.createdBy = requester;
        req.body.company = requester;
      } else {
        throw new UnAuthenticatedError(
          "You are not authorized to create a job drive"
        );
      }
    }
    const jobDrive = new JobDrive(req.body);
    const newJobDrive = await jobDrive.save();
    res.status(StatusCodes.CREATED).json(newJobDrive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get all jobDrives based on categories
 * @route GET /api/v1/jobDrive/all
 * @access Private
 */
const getJobDrives = async (req, res, next) => {
  try {
    const requester = req.user.userId;
    const ifCompany = await Company.findOne({ _id: requester });
    if (ifCompany) {
      const jobDrives = await JobDrive.find({ company: requester });
      res.status(StatusCodes.OK).json(jobDrives);
    } else {
      const {
        designations,
        locations,
        streams,
        program,
        driveDate,
        packageValue,
        eligibilityCriteria,
      } = req.query;
      let jobDrives;
      let query = {};
      const ifStudent = await Students.findOne({ _id: requester });
      const ifAdmin = await Admin.findOne({ _id: requester });
      if (ifStudent) {
        query.verified = true;
      } else if (ifAdmin) {
      } else {
        throw new UnAuthenticatedError(
          "You are not authorized to view job drives"
        );
      }
      if (designations) {
        query.designations = { $in: designations.split(",") };
      }

      if (locations) {
        query.locations = { $in: locations.split(",") };
      }

      if (streams) {
        query.streams = { $in: streams.split(",") };
      }

      if (program) {
        query.program = program;
      }

      if (driveDate) {
        query.driveDate = { $gte: new Date(driveDate) };
      }

      if (packageValue) {
        const min = packageValue.min;
        const max = packageValue.max;
        if (min && max) {
          query["packageValue.min"] = { $gte: min };
          query["packageValue.max"] = { $lte: max };
        } else if (min) {
          query["packageValue.min"] = { $gte: min };
        } else if (max) {
          query["packageValue.max"] = { $lte: max };
        }
      }

      if (eligibilityCriteria) {
        // const [backlog, cgpa] = eligibilityCriteria.split("-");
        const backlog = eligibilityCriteria.backlog;
        const cgpa = eligibilityCriteria.cgpa;
        if (backlog && cgpa) {
          query["eligibilityCriteria.backlog"] = { $lte: backlog };
          query["eligibilityCriteria.cgpa"] = { $gte: cgpa };
        } else if (backlog) {
          query["eligibilityCriteria.backlog"] = { $lte: backlog };
        } else if (cgpa) {
          query["eligibilityCriteria.cgpa"] = { $gte: cgpa };
        }
      }
      jobDrives = await JobDrive.find(query);
      res.status(StatusCodes.OK).json(jobDrives);
    }
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get jobDrive by id
 * @route POST /api/v1/jobDrive/:jobDriveId
 * @access Private
 */
const getJobDriveById = async (req, res, next) => {
  try {
    const jobDriveId = req.params.jobDriveId;
    const requester = req.user.userId;
    const jobDrives = await JobDrive.findById(jobDriveId);
    if (!jobDrives) {
      throw new NotFoundError(`No jobDrive with id :${jobDriveId}`);
    }
    const ifCompany = await Company.findOne({ _id: requester });
    if (ifCompany && ifCompany._id == jobDrives.company) {
      const jobDrive = await JobDrive.findById({
        _id: req.params.id,
      });
      res.status(StatusCodes.OK).json(jobDrive);
    } else {
      const ifStudent = await Students.findOne({ _id: requester });
      const ifAdmin = await Admin.findOne({ _id: requester });
      if (ifStudent) {
        if (!jobDrives.verified) {
          throw new UnAuthenticatedError(
            "You are not authorized to view job drives"
          );
        }
      } else if (ifAdmin) {
      } else {
        throw new UnAuthenticatedError(
          "You are not authorized to view job drives"
        );
      }
    }
    const jobDrive = await JobDrive.findById({
      _id: jobDriveId,
      verified: true,
    });
    res.status(StatusCodes.OK).json(jobDrive);
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Update jobDrive
 * @route PUT /api/v1/jobDrive/edit/:jobDriveId
 * @access Private
 */
const updateJobDrive = async (req, res, next) => {
  try {
    const {
      designations,
      locations,
      streams,
      program,
      startDate,
      lastDate,
      eligibilityCriteria,
      driveDate,
      packageValue,
      description,
      pdfLink,
    } = req.body;
    if (
      !designations ||
      !locations ||
      !streams ||
      !program ||
      !startDate ||
      !lastDate ||
      !eligibilityCriteria ||
      !driveDate ||
      !packageValue ||
      !description ||
      !pdfLink
    ) {
      throw new BadRequestError("Please provide all the required fields");
    }
    const jobDriveId = req.params.jobDriveId;
    const requester = req.user.userId;
    const jobDrive = await JobDrive.findById(jobDriveId);
    if (!jobDrive) {
      throw new NotFoundError(`No jobDrive with id :${jobDriveId}`);
    }
    const ifAdmin = await Admin.findOne({ _id: requester });
    var ifCompany = await Company.findOne({ _id: req.body.company });
    if (ifAdmin) {
      if (!ifCompany) {
        throw new BadRequestError("Company not found");
      }
      req.body.createdBy = requester;
    } else {
      ifCompany = await Company.findOne({ _id: requester });
      if (ifCompany) {
        if (jobDrive.company != requester || jobDrive.verified) {
          throw new UnAuthenticatedError(
            "You are not authorized to update this job drive"
          );
        }
        req.body.createdBy = requester;
      }
    }
    const updatedJobDrive = await JobDrive.findOneAndUpdate(
      { _id: jobDriveId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res.status(StatusCodes.OK).json({ updatedJobDrive });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Delete jobDrive by id
 * @route DELETE /api/v1/jobDrive/delete/:jobDriveId
 * @access Private
 */
const deleteJobDrive = async (req, res, next) => {
  try {
    const jobDriveId = req.params.jobDriveId;
    const requester = req.user.userId;
    const ifAdmin = await Admin.findOne({ _id: requester });
    const ifCompany = await Company.findOne({ _id: jobDriveId });
    if (ifAdmin) {
      if (!ifCompany) {
        throw new BadRequestError("Company not found");
      }
    } else if (ifCompany) {
      const jobDrive = await JobDrive.findById(req.params.id);
      if (jobDrive.company != requester || jobDrive.verified) {
        throw new UnAuthenticatedError(
          "You are not authorized to delete this job drive"
        );
      }
    } else {
      throw new UnAuthenticatedError(
        "You are not authorized to create a job drive"
      );
    }

    await JobDrive.findByIdAndRemove(req.params.id);
    res
      .status(StatusCodes.OK)
      .json({ message: "Job drive deleted successfully" });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc Get Applied student in jobDrive by id
 * @route GET /api/v1/getAppliedStudent/:jobDriveId
 * @access Private
 */
const getAppliedStudentForJob = async (req, res, next) => {
  try {
    const jobDriveId = req.params.jobDriveId;
    const requester = req.user.userId;
    const jobDrives = await JobDrive.findById(jobDriveId);
    if (!jobDrives) {
      throw new NotFoundError(`No jobDrive with id :${jobDriveId}`);
    }
    const ifStudent = await Students.findOne({ _id: requester });
    if (ifStudent) {
      throw new UnAuthenticatedError(
        "You are not authorized to view applied student in this job drive"
      );
    }
    const ifCompany = await Company.findOne({ _id: requester });
    if (ifCompany && ifCompany._id == jobDrives.company) {
      const appliedStudentIds = jobDrives.appliedBy;
      const appliedStudents = await Promise.all(
        appliedStudentIds.map(async (studentId) => {
          const student = await Students.findById(studentId).select(
            "-password"
          );
          return student;
        })
      );
      res.status(StatusCodes.OK).json({ appliedStudents });
    } else {
      const appliedStudentIds = jobDrives.appliedBy;
      const appliedStudents = await Promise.all(
        appliedStudentIds.map(async (studentId) => {
          const student = await Students.findById(studentId).select(
            "-password"
          );
          return student;
        })
      );

      res.status(StatusCodes.OK).json({ appliedStudents });
    }
  } catch (error) {
    next(error);
  }
};

export {
  createJobDrive,
  getJobDrives,
  getJobDriveById,
  updateJobDrive,
  deleteJobDrive,
  getAppliedStudentForJob,
};
