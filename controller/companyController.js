import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import Admin from "../models/admin.js";
import Company from "../models/Company.js";
import Student from "../models/students.js";
import JobDrive from "../models/jobDrive.js";
import fs from "fs";
/**

@desc Get a single company by ID
@route GET /api/v1/company/:companyId
@access Private
*/
const getCompanyById = async (req, res, next) => {
  try {
    // Get the userId from the authenticated user
    const userId = req.user.userId;
    const admin = await Admin.findOne({ _id: userId });
    const student = await Student.findOne({ _id: userId });
    if (admin || student) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const companyId = req.params.companyId;
    if (companyId !== userId) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    // Get the company with the given ID from the database
    const company = await Company.findOne({ _id: companyId }).populate({
      path: "placementDrives",
      populate: {
        path: "company",
      },
    });
    // If no company is found, throw a NotFoundError with an error message
    if (!company) {
      throw new NotFoundError("Company not found");
    } else {
      // Otherwise, send the company object to the client with a 200 (OK) status code
      res.status(StatusCodes.OK).json({ company });
    }
  } catch (error) {
    // If an error occurs, pass it to the error handling middleware
    next(error);
  }
};

/**

@desc Update a company by ID
@route PATCH /api/v1/company/:companyId
@access Private
*/
const updateCompanyById = async (req, res, next) => {
  try {
    // Destructure the request body to get the values for updating the company
    const {
      name,
      email,
      website,
      description,
      logo,
      linkedin,
      address,
      programs,
      streams,
    } = req.body;

    // Destructure the request body to get HR details
    const { hrName, hrEmail, hrPhone } = req.body;

    // Check if any required fields are missing in the request body
    if (
      !name ||
      !email ||
      !website ||
      !description ||
      !logo ||
      !linkedin ||
      !address ||
      !hrName ||
      !hrEmail ||
      !programs ||
      !streams ||
      !hrPhone
    ) {
      // Throw a BadRequestError if any required field is missing
      throw new BadRequestError("Please provide all the required fields");
    }
    // Get the userId from the request object
    const userId = req.user.userId;
    // Check if the user is a student. If yes, throw an UnAuthenticatedError
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent) {
      throw new UnAuthenticatedError(
        "You are not authorized to edit this company"
      );
    }
    // Get the companyId from the request parameters
    const companyId = req.params.companyId;

    // Find the company by ID
    const company = await Company.findOne({ _id: companyId }).select(
      "+password"
    );

    // If the company is not found, throw a NotFoundError
    if (!company) {
      throw new UnAuthenticatedError(`No company with id :${companyId}`);
    }
    req.body.password = company?.password;
    // Update the company by ID with the values from the request body
    const updatedCompany = await Company.findOneAndUpdate(
      { _id: companyId },
      req.body,
      {
        new: true, // Return the updated document
        runValidators: true, // Run model validators on the update operation
      }
    );

    // Return the updated company as a response
    res.status(StatusCodes.OK).json({ updatedCompany });
  } catch (error) {
    // Pass any error to the error handling middleware
    next(error);
  }
};
const createJobDrive = async (req, res, next) => {
  try {
    const {
      designations,
      locations,
      streams,
      programs,
      startDate,
      lastDate,
      eligibilityCriteria,
      driveDate,
      packageValue,
      description,
      pdfLink,
    } = req.body;
    console.log(req.body);
    if (
      !designations ||
      !locations ||
      !streams ||
      !programs ||
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
    const locationArray = locations.split(",");
    const designationArray = designations.split(",");
    req.body.locations = locationArray;
    req.body.designations = designationArray;
    const userId = req.user.userId;
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to create a job drive"
      );
    }
    var company = await Company.findOne({ _id: userId });
    if (!company) {
      throw new UnAuthenticatedError(
        "You are not authorized to create a job drive"
      );
    }
    req.body.company = company?._id;
    const jobDrive = new JobDrive(req.body);
    const newJobDrive = await jobDrive.save();
    const updateCompany = await Company.findOneAndUpdate(
      { _id: userId },
      { $push: { placementDrives: newJobDrive._id } },
      { new: true,
        runValidators: true,
      }
    );
    res
      .status(StatusCodes.CREATED)
      .json({ message: "Job Created Successfully", jobDrive: newJobDrive });
  } catch (error) {
    next(error);
  }
};
const getJobDrive = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    console.log(userId);
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    console.log(ifAdmin, ifStudent);
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    const jobDrive = await JobDrive.find({ company: userId }).sort({ driveDate: -1 }).populate(
      "company",
      "name"
    );

    console.log(jobDrive);
    res.status(StatusCodes.OK).json({ jobs: jobDrive });
  } catch (error) {
    next(error);
  }
};
const getJobDriveById = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    const jobId = req.params.jobId;
    console.log(userId, jobId);
    const jobDrive = await JobDrive.findOne({ _id: jobId })
      .populate("company", "name")
      .populate(
        "appliedBy",
        "name enrollmentNo personalDetails.stream applicationStatus placementDetails.selected"
      );
    console.log(jobDrive);

    if (jobDrive?.company?._id.toString() !== userId) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }

    if (!jobDrive) {
      throw new NotFoundError("Job Drive not found");
    }
    res.status(StatusCodes.OK).json({ job: jobDrive });
  } catch (error) {
    next(error);
  }
};

const updateJobDrive = async (req, res, next) => {
  try {
    const {
      designations,
      locations,
      streams,
      programs,
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
      !programs ||
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
    const userId = req.user.userId;
    const jobDriveId = req.params.jobId;
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    var company = await Company.findOne({ _id: userId });
    const job = await JobDrive.findOne({ _id: jobDriveId });
    if (!company || job?.company.toString() !== company?._id.toString()) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    req.body.company = company?._id;
    const updatedJobDrive = await JobDrive.findOneAndUpdate(
      { _id: jobDriveId },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );
    res
      .status(StatusCodes.OK)
      .json({ message: "Job Updated Successfully", jobDrive: updatedJobDrive });
  } catch (error) {
    next(error);
  }
};
const getStudentById = async (req, res, next) => {
  try {
    const companyId = req.user.userId;
    const company = await Company.findOne({ _id: companyId });
    if (!company) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const studentId = req.params.studentId;
    const student = await Student.findOne({ _id: studentId }).populate("placementDetails.selectedIn.company", "name");
    if (!student) {
      throw new NotFoundError(`No student with ID: ${studentId}`);
    }
    return res.status(StatusCodes.OK).json({
      student,
    });
  } catch (error) {
    next(error);
  }
};
const createCSVFinal = async (data, filePath) => {
  try {
    let csvContent = '';
    let headerFields = [];
    let headerFieldNames = [];

    // Recursive function to generate header fields and names
    const generateHeader = (data, prefix = '') => {
      for (const key in data) {
        if (Array.isArray(data[key])) {
          // Handle array data
          headerFields.push(`${prefix}${key}`);
          headerFieldNames.push(`${prefix}${key}`);
        } else if (typeof data[key] === 'object' && data[key] !== null) {
          // Handle nested objects
          generateHeader(data[key], `${prefix}${key}.`);
        } else {
          // Handle simple fields
          headerFields.push(`${prefix}${key}`);
          headerFieldNames.push(`${prefix}${key}`);
        }
      }
    };

    // Generate the header fields and names
    generateHeader(data[0]);

    // Constructing the CSV header line
    const headerLine = headerFieldNames.map((name) => `"${name}"`).join(',');

    // Appending the header line to the CSV content
    csvContent += headerLine + '\n';

    // Recursive function to extract nested values and stringify them
    const extractNestedValue = (row, field) => {
      const nestedFields = field.split('.');
      let nestedValue = row;
      for (let i = 0; i < nestedFields.length; i++) {
        nestedValue = nestedValue[nestedFields[i]];
        if (nestedValue === undefined) break;
      }
      if (typeof nestedValue === 'object' && nestedValue !== null) {
        return `"${serializeNestedValue(nestedValue)}"`;
      }
      return `"${nestedValue}"`;
    };
    
    const serializeNestedValue = (value) => {
      if (Array.isArray(value)) {
        return value.map((item) => serializeNestedValue(item)).join(', ');
      } else if (typeof value === 'object') {
        return Object.keys(value)
          .map((key) => `${key}: ${serializeNestedValue(value[key])}`)
          .join(', ');
      }
      return value;
    };
    
    
    // Constructing the CSV data lines
    data.forEach((row) => {
      const rowValues = headerFields.map((field, index) => {
        // Handle nested fields
        if (field.includes('.')) {
          return extractNestedValue(row, field);
        }
        return `"${row[field]}"`;
      });

      const rowLine = rowValues.join(',');

      csvContent += rowLine + '\n';
    });

    // Writing the CSV content to the file
    fs.writeFileSync(filePath, csvContent, { encoding: 'utf8' });

    console.log('CSV file created successfully.');

  } catch (error) {
    console.error('Error creating CSV file:', error);
  }
};
const getStudentByIdInCSV = async (req, res, next) => {
  try {
    const companyId = req.user.userId;
    const company = await Company.findOne({ _id: companyId });
    if (!company) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const studentIds = req.body.studentIds;
    const students = await Student.find({ _id: { $in: studentIds } }).populate("placementDetails.selectedIn.company", "name");
console.log(students);
    // Convert student data to JSON
    const studentData = students.map(student => student.toObject());
    console.log(studentData);

    const timestamp = Date.now().toString();
    const randomString = Math.random().toString(36).substring(2, 15);
    const filename = `student_${timestamp}_${randomString}.csv`;
    const filePath = `${filename}`;

    // Create the CSV file
    await createCSVFinal(studentData, filePath);

    // Set the response headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);

    // Stream the file as the response
    const fileStream = fs.createReadStream(filePath);
    fileStream.pipe(res);

    // Delete the temporary CSV file after streaming
    fileStream.on('close', () => {
      fs.unlinkSync(filePath);
    });
  } catch (error) {
    next(error);
  }
};
const deleteJobDrive = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const jobDriveId = req.params.jobId;
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    var company = await Company.findOne({ _id: userId });
    const job = await JobDrive.findOne({ _id: jobDriveId });
    if (!company || job?.company.toString() !== company?._id.toString()) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    const updateCompany = await Company.findOneAndUpdate(
      { _id: userId },
      { $pull: { placementDrives: job._id } },
      { new: true,
        runValidators: true,
      }
    );
    await JobDrive.findOneAndDelete({
      _id: jobDriveId,
    });
    res.status(StatusCodes.OK).json({ message: "Job Deleted Successfully" });
  } catch (error) {
    next(error);
  }
};
const actionForStudentForJobDrive = async (req, res, next) => {
  try {
    const { action, jobProfile, jobPackage } = req.body;
    if (!action) {
      throw new BadRequestError("Please provide all the required fields");
    }
    const studentId = req.params.studentId;
    const userId = req.user.userId;
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    var company = await Company.findOne({ _id: userId });
    if (!company) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    let student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new NotFoundError(`No student with ID: ${studentId}`);
    }
    if (action === "hire") {
      if (!action || !jobProfile || !jobPackage) {
        throw new BadRequestError("Please provide all the required fields");
      }
      if (student.placementDetails.rejectedFrom.includes(company?._id)) {
        student = await Student.findOneAndUpdate(
          { _id: studentId },
          { $pull: { "placementDetails.rejectedFrom": userId } },
          {
            new: true,
            runValidators: true,
          }
        );
      }
      student.placementDetails.selected = true;
      student.placementDetails.selectedIn.company = company?._id;
      student.placementDetails.selectedIn.jobProfile = jobProfile;
      student.placementDetails.selectedIn.package = jobPackage;
      await student.save();
    } else if (action === "reject") {
      console.log(action);
      const updatedStudent = await Student.findOneAndUpdate(
        { _id: studentId },
        { $push: { "placementDetails.rejectedFrom": userId } },
        {
          new: true,
          runValidators: true,
        }
      );
      student.placementDetails.selected = false;
      student.placementDetails.selectedIn = {};
      await student.save();
    }
    res
      .status(StatusCodes.OK)
      .json({ message: "Action Performed Successfully" });
  } catch (error) {
    next(error);
  }
};
const getStats = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    const ifAdmin = await Admin.findOne({ _id: userId });
    const ifStudent = await Student.findOne({ _id: userId });
    if (ifStudent || ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    var company = await Company.findOne({ _id: userId });
    if (!company) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform action for job drive"
      );
    }
    const totalJobDrives = await JobDrive.find({ company: userId }).count();
    const totalStudentsApplied=await JobDrive.find({company:userId}).populate('appliedBy');
    console.log("totalStudentsApplied",totalStudentsApplied)  
    const selectedStudentsCount = totalStudentsApplied.reduce((count, jobDrive) => {
      const selectedStudents = jobDrive.appliedBy.filter(student => student.placementDetails.selected === true);
      return count + selectedStudents.length;
    }, 0);
    const notSelectedStudentsCount = totalStudentsApplied.reduce((count, jobDrive) => {
      const selectedStudents = jobDrive.appliedBy.filter(student => student.placementDetails.selected === false);
      return count + selectedStudents.length;
    }, 0);
    
    console.log(selectedStudentsCount);
    const stats={
      totalJobDrives,
      totalStudentsApplied:totalStudentsApplied.length,
      totalSelectedStudents:selectedStudentsCount,
      totalNotSelectedStudents:notSelectedStudentsCount
    }
    res.status(StatusCodes.OK).json({
     stats
    });
  } catch (error) {
    next(error);
  }
};
export {
  getCompanyById,
  updateCompanyById,
  getJobDrive,
  getJobDriveById,
  createJobDrive,
  updateJobDrive,
  deleteJobDrive,
  getStudentById,
  getStudentByIdInCSV,
  actionForStudentForJobDrive,
  getStats,
};
