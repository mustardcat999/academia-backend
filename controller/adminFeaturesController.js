import { StatusCodes } from "http-status-codes";
import {
  BadRequestError,
  NotFoundError,
  UnAuthenticatedError,
} from "../errors/index.js";
import Admin from "../models/admin.js";
import Student from "../models/students.js";
import JobDrive from "../models/jobDrive.js";
import Students from "../models/students.js";
import nodemailer from "nodemailer";
import Company from "../models/Company.js";
import { sendMail } from "./communication.js";
import jobDrive from "../models/jobDrive.js";
import { Parser } from "json2csv";
import fs from "fs";

/**

@desc Get all companies based on query parameters
@route GET /api/v1/admin/students
@access Private
*/
// Define an asynchronous function called getAllCompanies that takes in three parameters: req, res, and next
const getStudents = async (req, res, next) => {
  try {
    // Extract the userId property from the request object
    const userId = req.user.userId;

    // Check if the authenticated user is a admin; if so, throw an UnAuthenticatedError
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to view all students"
      );
    }
    const {
      name,
      email,
      enrollmentNo,
      gender,
      stream,
      applicationStatus,
      selected,
      yearOfPassing,
      selectedIn,
      cgpa,
    } = req.query;
    console.log(req.query);
    // const query = {};

    // if (name) {
    //   query["name"] = { $regex: name, $options: "i" };
    // }
    // if (email) {
    //   query["email"] = { $regex: email, $options: "i" };
    // }
    // if (enrollmentNo) {
    //   query["enrollmentNo"] = { $regex: enrollmentNo, $options: "i" };
    // }
    // if (applicationStatus) {
    //   query["applicationStatus"] = { $regex: applicationStatus, $options: "i" };
    // }
    // if (gender) {
    //   query["personalDetails.gender"] = { $regex: gender, $options: "i" };
    // }
    // if (stream) {
    //   query["personalDetails.stream"] = { $regex: stream, $options: "i" };
    // }
    // if (selected) {
    //   query["placementDetails.selected"] = { $regex: selected, $options: "i" };
    // }
    // if (yearOfPassing) {
    //   query["academicDetails.yearOfPassing"] = { $regex: yearOfPassing, $options: "i" };
    // }
    // const students = await Student.find(query);
    //   .select(
    //     "name enrollmentNo personalDetails.stream applicationStatus placementDetails.selected"
    //   ).populate();

    // res.status(StatusCodes.OK).json({
    //   students,
    // });
    const fields = [
      "name",
      "email",
      "enrollmentNo",
      "applicationStatus",
      "personalDetails.gender",
      "personalDetails.stream",
      "placementDetails.selected",
      "academicDetails.yearOfPassing",
    ];

    const query = fields.reduce((acc, field) => {
      if (field === "applicationStatus" && req.query[field] === "verified") {
        acc = {
          $and: [
            acc,
            { applicationStatus: { $regex: "verified", $options: "i" } },
          ],
        };
      } else if (
        field === "applicationStatus" &&
        req.query[field] === "unverified"
      ) {
        acc = {
          $and: [
            acc,
            { applicationStatus: { $regex: "unverified", $options: "i" } },
          ],
        };
      } else {
        if (req.query[field]) {
          acc = {
            $and: [
              acc,
              { [field]: { $regex: req.query[field], $options: "i" } },
            ],
          };
        }
      }
      return acc;
    }, {});
    console.log(query);
    const students = await Student.find(query);
    // .select(
    //   "name enrollmentNo personalDetails.stream applicationStatus placementDetails.selected"
    // )
    // .populate();
    const check = await Student.find({ applicationStatus: "verified" });
    console.log(check);
    res.status(StatusCodes.OK).json({
      students,
    });
  } catch (error) {
    // Pass any caught errors to the error handling middleware
    next(error);
  }
};

/**
 * @desc Get a student by id
 * @route GET /api/v1/admin/students/:studentId
 * @access Private
 */
const getStudentById = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const studentId = req.params.studentId;
    const student = await Student.findOne({ _id: studentId }).populate(
      "placementDetails.selectedIn.company",
      "name"
    );
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
const getCompany = async (req, res, next) => {
  try {
    // Extract the userId property from the request object
    const userId = req.user.userId;

    // Check if the authenticated user is a admin; if so, throw an UnAuthenticatedError
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to view all students"
      );
    }
    const companies = await Company.find({}).select("name email logo website");
    res.status(StatusCodes.OK).json({
      companies,
    });
  } catch (error) {
    // Pass any caught errors to the error handling middleware
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
    const userId = req.user.userId;

    // Check if the authenticated user is a admin; if so, throw an UnAuthenticatedError
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to view all students"
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
const getCompanyById = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const companyId = req.params.companyId;
    const company = await Company.findOne({ _id: companyId }).populate({
      path: "placementDrives",
      populate: {
        path: "company",
      },
    });

    if (!company) {
      throw new NotFoundError(`No company with ID: ${companyId}`);
    }
    return res.status(StatusCodes.OK).json({
      company,
    });
  } catch (error) {
    next(error);
  }
};
const getJob = async (req, res, next) => {
  try {
    // Extract the userId property from the request object
    const userId = req.user.userId;

    // Check if the authenticated user is a admin; if so, throw an UnAuthenticatedError
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to view all students"
      );
    }
    const jobs = await jobDrive
      .find({})
      .sort({ driveDate: -1 })
      .populate("company", "name");
    res.status(StatusCodes.OK).json({
      jobs,
    });
  } catch (error) {
    // Pass any caught errors to the error handling middleware
    next(error);
  }
};
const getJobById = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const jobId = req.params.jobId;
    const job = await jobDrive
      .findOne({ _id: jobId })
      .populate("company", "name")
      .populate(
        "appliedBy",
        "name enrollmentNo personalDetails.stream applicationStatus placementDetails.selected"
      );
    if (!job) {
      throw new NotFoundError(`No job with ID: ${jobId}`);
    }
    return res.status(StatusCodes.OK).json({
      job,
    });
  } catch (error) {
    next(error);
  }
};
/**
@desc Verify or unverify a student's account
@route PUT /api/v1/admin/verifyStudent/:studentId
@access Private (only accessible to admin users)
*/
// Define an asynchronous function called verifyStudent that takes in three parameters: req, res, and next
const verifyStudent = async (req, res, next) => {
  try {
    const userId = req.user.userId;
    // Check if the user performing the action is an admin user
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    // Retrieve the student ID from the request parameters
    const studentId = req.params.studentId;
    // Find the student in the database using the studentId ID stored in the request object
    const student = await Students.findOne({ _id: studentId });
    if (!student) {
      throw new NotFoundError(`No student with id :${studentId}`);
    }
    // Toggle the verified status of the student's account
    if (student?.applicationStatus === "verified") {
      student.applicationStatus = "unverified";
    } else {
      student.applicationStatus = "verified";
    }
    // Save the updated student object in the database
    await student.save();
    // Return a success message with the updated verification status of the student's account
    return res.status(StatusCodes.OK).json({
      message: ` Student ${
        student?.applicationStatus === "verified" ? "verified" : "unverified"
      } successfully`,
    });
  } catch (err) {
    next(err);
  }
};

/**
@desc Update an existing admin user's profile
@route PUT /api/v1/admin/verifyJobDrive/:jobDriveId
@access Private
*/
// Define an asynchronous function called verifyJobDrive that takes in three parameters: req, res and next
const verifyJobDrive = async (req, res, next) => {
  try {
    // Extract the user ID from the request object
    const userId = req.user.userId;
    // Find the admin user in the database using the user ID
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    // Extract the job drive ID from the request object
    const jobDriveId = req.params.jobDriveId;
    // Find the job drive in the database using the job drive ID
    const jobDrive = await JobDrive.findOne({ _id: jobDriveId });
    if (!jobDrive) {
      throw new NotFoundError(`No job drive with ID: ${jobDriveId}`);
    }
    // Update the job drive's verified status
    var flag = jobDrive.verified;
    jobDrive.verified = !jobDrive.verified;
    // Save the updated job drive object in the database
    await jobDrive.save();
    // Send a response indicating that the job drive's verified status was updated successfully
    return res.status(StatusCodes.OK).json({
      message: `Job drive ${!flag ? "verified" : "unverified"} successfully`,
    });
  } catch (err) {
    // Call the error handling middleware function
    next(err);
  }
};
/**
@desc This function converts a JSON object into an HTML string.
It loops through the properties of the JSON object, selects desired properties,
sorts them alphabetically, and creates an HTML string for each selected property.
The resulting HTML string is returned.
@param {Object} jsonData - A JSON object to convert to HTML.
@returns {String} - An HTML string representing the JSON object.
*/
function jsonToHtml(jsonData) {
  // Start building the HTML string with a div tag
  let html = "<div>";

  // Extract the desired properties and sort them alphabetically
  const properties = Object.keys(jsonData).filter((prop) => {
    return [
      "company",
      "designations",
      "locations",
      "streams",
      "program",
      "eligibilityCriteria",
      "startDate",
      "lastDate",
      "driveDate",
      "packageValue",
      "description",
      "pdfLink",
    ].includes(prop);
  });

  // Loop through the sorted properties and create the HTML
  properties.forEach((prop) => {
    let value = jsonData[prop];

    if (prop === "packageValue") {
      // If the property is packageValue, format the value as a string
      value = `Min: ${jsonData.packageValue.min} Max: ${jsonData.packageValue.max}`;
    }

    if (prop === "eligibilityCriteria") {
      // If the property is eligibilityCriteria, format the value as a paragraph tag
      value = `<p>Backlog: ${jsonData.eligibilityCriteria.backlog} CGPA: ${jsonData.eligibilityCriteria.cgpa}</p>`;
    }

    // Add a header tag and the property value to the HTML string
    html += `<h1>${prop.toUpperCase()}:</h1><p> ${value}</p>`;
  });

  // Close the div tag and return the final HTML string
  html += "</div>";
  return html;
}
/**
 * @desc @desc This function sends an email to a Google group with information about a job drive.
    It extracts the user ID from the request object and finds the admin user in the database using the user ID.
    If the user is not an admin, an error is thrown.
    It extracts the job drive ID from the request object and finds the job drive in the database using the job drive ID.
    If no job drive is found, an error is thrown.
    It converts the job drive object to an object and replaces the company ID with the company name.
    It creates an HTML string using the jsonToHtml function.
    It sets up an email transport object using nodemailer and sends the email to the specified Google group.
    If the email fails to send, an error is logged.
    If the email sends successfully, a response is sent indicating that the email was sent successfully.
    @param {Object} req - The request object.
    @param {Object} res - The response object.
    @param {Function} next - The next middleware function.
    @returns {Object} - A response indicating that the email was sent successfully.
 * @route PUT /api/v1/admin/sendMail/:jobDriveId
 * @access Private
 */
// Define an asynchronous function called sendMailToGoogleGroups that takes in three parameters: req, res and next
const sendMailToGoogleGroups = async (req, res, next) => {
  try {
    // Extract the user ID from the request object
    const userId = req.user.userId;

    // Find the admin user in the database using the user ID
    const ifAdmin = await Admin.findOne({ _id: userId });

    // If no admin user is found, throw an error
    if (!ifAdmin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const fromEmail = ifAdmin.email;
    const { toEmail } = req.body;
    if (!toEmail) {
      throw new BadRequestError("Please provide all the required fields");
    }
    // Extract the job drive ID from the request object
    const jobDriveId = req.params.jobDriveId;

    // Find the job drive in the database using the job drive ID
    const jobDrive = await JobDrive.findOne({ _id: jobDriveId });
    // If no job drive is found, throw an error
    if (!jobDrive) {
      throw new NotFoundError(`No job drive with ID: ${jobDriveId}`);
    }
    if (!jobDrive.verified) {
      throw new BadRequestError("Please verify the job drive first");
    }
    // Convert the job drive object to a plain JavaScript object
    const jobDriveObj = jobDrive.toObject();

    // Find the company associated with the job drive
    const companyName = await Company.findOne({
      _id: jobDriveObj.company,
    });

    // Update the jobDriveObj company property with the company name
    jobDriveObj.company = companyName.name;
    console.log(jobDriveObj);
    await sendMail({
      fromEmail: fromEmail,
      toEmail: toEmail,
      mailSubject: `New Job Drive- ${jobDriveObj.company} @${jobDriveObj.driveDate}}`,
      senderDetails: {
        name: ifAdmin.name,
        email: ifAdmin.email,
      },
      receiverDetails: {
        name: "To Google Groups",
        email: toEmail,
      },
      mailBody: `
    <div>
    <h1>Job Drive Details</h1>

    <table>
      <tr>
        <th>Company</th>
        <td>${jobDriveObj?.company}</td>
      </tr>
      <tr>
        <th>Designations</th>
        <td>${jobDriveObj?.designations}</td>
      </tr>
      <tr>
        <th>Locations</th>
        <td>${jobDriveObj?.locations}</td>
      </tr>
      <tr>
        <th>Streams</th>
        <td>${jobDriveObj?.streams}</td>
      </tr>
      <tr>
        <th>Program</th>
        <td>${jobDriveObj?.program}</td>
      </tr>
      <tr>
        <th>Start Date</th>
        <td>${jobDriveObj?.startDate}</td>
      </tr>
      <tr>
        <th>Last Date</th>
        <td>${jobDriveObj?.lastDate}</td>
      </tr>
      <tr>
        <th>Eligibility Criteria</th>
        <td>
          <p>Backlog: ${jobDriveObj?.eligibilityCriteria.backlog}</p>
          <p>CGPA: ${jobDriveObj?.eligibilityCriteria.cgpa}</p>
        </td>
      </tr>
      <tr>
        <th>Drive Date</th>
        <td>${jobDriveObj?.driveDate}</td>
      </tr>
      <tr>
        <th>Package Value</th>
        <td>
          <p>Min: ${jobDriveObj?.packageValue.min}</p>
          <p>Max: ${jobDriveObj?.packageValue.max}</p>
        </td>
      </tr>
      <tr>
        <th>Description</th>
        <td>${jobDriveObj?.description}</td>
      </tr>
      <tr>
        <th>PDF Link</th>
        <td>${jobDriveObj?.pdfLink}</td>
      </tr>
    </table>
    </div>
`,
    });

    return res.status(StatusCodes.OK).json({
      message: "Mail sent successfully",
    });
  } catch (err) {
    // Call the error handling middleware function
    next(err);
  }
};

const sendMessagesOnMail = async (req, res, next) => {
  try {
    const { mailsArray, mailSubject, mailBody } = req.body;
    if (!mailsArray || !mailSubject || !mailBody) {
      throw new BadRequestError("Please provide all the required fields");
    }
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    await sendMail({
      fromEmail: admin.email,
      toEmail: mailsArray,
      mailSubject: `${mailSubject}-Mail from ${admin.name}`,
      senderDetails: {
        name: admin.name,
        email: admin.email,
      },
      receiverDetails: {
        name: "",
        email: "",
      },
      mailBody: `
      <div>
      <h1>Message from ${admin?.name}</h1>
      <p>${mailBody}</p>
      </div>`,
    });
    return res.status(StatusCodes.OK).json({
      message: `Message sent successfully`,
    });
  } catch (error) {
    next(error);
  }
};

//Send mail to specific student
const sendMailToSelectedStudent = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const studentId = req.params.studentId;
    const student = await Student.findOne({ _id: studentId });
    if (!student) {
      throw new NotFoundError(`No student with ID: ${studentId}`);
    }
    await sendMail({
      fromEmail: admin.email,
      toEmail: student.email,
      mailSubject: `${req?.body?.mailSubject}-Mail from ${admin.name}`,
      senderDetails: {
        name: admin.name,
        email: admin.email,
      },
      receiverDetails: {
        name: student.name,
        email: student.email,
      },
      mailBody: `
      <div>
      <h1>Message from ${admin?.name}</h1>
      <p>${req?.body?.mailMessage}</p>
      </div>`,
    });
    return res.status(StatusCodes.OK).json({
      message: `Message sent successfully`,
    });
  } catch (error) {
    next(error);
  }
};
//Send mail to many users
const sendMailToUsers = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const mailArray = req.body.mailArray;
    for (let i = 0; i < mailArray.length; i++) {
      await sendMail({
        fromEmail: admin.email,
        toEmail: mailArray[i],
        mailSubject: req.body.mailSubject,
        senderDetails: {
          name: admin.name,
          email: admin.email,
        },
        receiverDetails: {
          name: mailArray[i],
          email: mailArray[i],
        },
        mailBody: `
      <div>
      <h1>Message from ${admin?.name}</h1>
      <p>${req?.body?.mailMessage}</p>
      </div>`,
      });
    }
    return res.status(StatusCodes.OK).json({
      message: `Message sent successfully`,
    });
  } catch (error) {
    next(error);
  }
};
const getAppliedStudents = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const jobDriveId = req.params.jobId;
    const jobDrive = await JobDrive.findOne({ _id: jobDriveId });
    if (!jobDrive) {
      throw new NotFoundError(`No job drive with ID: ${jobDriveId}`);
    }
    const appliedStudents = await JobDrive.findOne({
      _id: jobDriveId,
    }).populate("appliedBy");
    return res.status(StatusCodes.OK).json({
      appliedStudents,
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    const streamsList = [
      {
        title: "Computer Science",
        value: "Computer Science",
      },
      {
        title: "Electronics",
        value: "Electronics",
      },
      {
        title: "Mechanical",
        value: "Mechanical",
      },
      {
        title: "Civil",
        value: "Civil",
      },
      {
        title: "Electrical",
        value: "Electrical",
      },
      {
        title: "Agriculture",
        value: "Agriculture",
      },
      {
        title: "Mining",
        value: "Mining",
      },
    ];
    const year = parseInt(req.query.statsYear);
    const totalJobsCount = await JobDrive.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    });
    const totalVerifiedJobsCount = await JobDrive.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
      verified: true,
    });
    const totalUnverifiedJobsCount = await JobDrive.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
      verified: false,
    });
    const totalStudentsCount = await Student.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
    });
    const totalVerifiedStudentsCount = await Student.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
      applicationStatus: "verified",
    });
    const totalUnverifiedStudentsCount = await Student.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
      applicationStatus: "unverified",
    });

    const totalPlacedStudentsCount = await Student.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
      "placementDetails.selected": true,
    });

    const totalNotPlacedStudentsCount = await Student.countDocuments({
      createdAt: {
        $gte: new Date(year, 0, 1),
        $lt: new Date(year + 1, 0, 1),
      },
      "placementDetails.selected": false,
    });

    const branchWiseData = await Promise.all(
      streamsList.map(async (stream) => {
        const placedCount = await Student.countDocuments({
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
          "personalDetails.stream": stream.value,
          "placementDetails.selected": true,
        });

        const unplacedCount = await Student.countDocuments({
          createdAt: {
            $gte: new Date(year, 0, 1),
            $lt: new Date(year + 1, 0, 1),
          },
          "personalDetails.stream": stream.value,
          "placementDetails.selected": false,
        });

        return {
          branch: stream.title,
          placed: placedCount,
          unplaced: unplacedCount,
        };
      })
    );

    res.status(StatusCodes.OK).json({
      stats: {
        totalStudentsCount,
        totalPlacedStudentsCount,
        totalNotPlacedStudentsCount,
        totalJobsCount,
        totalVerifiedJobsCount,
        totalUnverifiedJobsCount,
        totalVerifiedStudentsCount,
        totalUnverifiedStudentsCount,
        branchWiseData,
      },
    });
  } catch (error) {
    next(error);
  }
};

export {
  verifyStudent,
  verifyJobDrive,
  sendMailToGoogleGroups,
  sendMessagesOnMail,
  getStudents,
  getStudentById,
  getCompany,
  getCompanyById,
  getJob,
  getJobById,
  sendMailToUsers,
  sendMailToSelectedStudent,
  getAppliedStudents,
  getStats,
  getStudentByIdInCSV,
};
