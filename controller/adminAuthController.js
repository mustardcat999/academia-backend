import Admin from "../models/admin.js";
import { StatusCodes } from "http-status-codes";
import { BadRequestError, UnAuthenticatedError } from "../errors/index.js";
import { sendMail } from "./communication.js";
import Company from "../models/Company.js";

/**
 * @desc Register a new admin user
 * @route POST /api/v1/auth/admin/register
 * @access Public
 */
// Define an asynchronous function called registerAdmin that takes in three parameters: req, res, and next
const createAdmin = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    //get email of all the admins

    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }

    // Extract the name, email, and password properties from the request body using destructuring
    const { name, email, password } = req.body;

    // Check if all the required fields are present
    if (!name || !email || !password) {
      // If any of the fields are missing, throw a BadRequestError with an error message
      throw new BadRequestError("Please provide all values. ");
    }

    // Check if an admin with the same email already exists in the database
    const adminAlreadyExists = await Admin.findOne({ email });
    if (adminAlreadyExists) {
      // If an admin with the same email exists, throw a BadRequestError with an error message
      throw new BadRequestError("An admin with this email already exists");
    }

    // If the admin does not exist, create a new admin object in the database with the provided name, email, and password
    const newAdmin = await Admin.create({ name, email, password });
    if (!newAdmin) {
      // If the admin is not created, throw a BadRequestError with an error message
      throw new BadRequestError("Admin could not be created");
    }
    const allAdmins = await Admin.find({});
    const allAdminsEmail = allAdmins?.map((admin) => {
      return { email: admin.email, name: admin.name };
    });
    console.log(allAdminsEmail);
    for (let i = 0; i < allAdminsEmail.length; i++) {
      const sendMailToAllAdmins = await sendMail({
        fromEmail: admin.email,
        toEmail: allAdminsEmail[i].email,
        mailSubject: `New Admin created`,
        senderDetails: {
          name: admin.name,
          email: admin.email,
        },
        receiverDetails: {
          name: allAdminsEmail[i].name,
          email: allAdminsEmail[i].email,
        },
        mailBody: `
        <div>
        <h1>New Admin created</h1>
        <p>Admin details are as follows:</p>
        <p>Name: <strong>${newAdmin?.name}</strong></p>
        <p>Email: <strong>${newAdmin?.email}</strong></p>
        <p>Admin who created the new admin:</p>
        <p>Name: <strong>${admin.name}</strong></p>
        <p>Email: <strong>${admin.email}</strong></p>
        </div>`,
      });
    }
    // Send a response to the client with a 201 (Created) status code, including the admin's email and name, and the generated token
    res.status(StatusCodes.CREATED).json({
      message: "Admin created successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Update an existing admin user's profile
 * @route PUT /api/v1/auth/admin/profile
 * @access Private
 */
// Define an asynchronous function called updateUser that takes in two parameters: req and res
const updateAdmin = async (req, res, next) => {
  try {
    // Extract the name, gender, designation, phone, and aadharno properties from the request body using destructuring
    const { name, gender, designation, phone, aadharno } = req.body;
    console.log(req.body);
    // Check if all the required fields are present
    if (!name || !gender || !designation || !phone || !aadharno) {
      // If any of the fields are missing, throw a BadRequestError with an error message
      throw new BadRequestError("Please provide all values");
    }

    // Find the user in the database using the user ID stored in the request object
    const userId = req.user.userId;
    const user = await Admin.findOne({ _id: userId });

    // Update the user's name, gender, designation, phone, and aadharno properties with the values from the request body
    user.name = name;
    user.gender = gender;
    user.designation = designation;
    user.phone = phone;
    user.aadharno = aadharno;

    // Save the updated user object in the database
    await user.save();

    // Generate a new JSON web token (JWT) for the updated user object
    const token = user.createJWT();

    // Send a response to the client with a 200 (OK) status code, including the updated user object and the new JWT token
    res.status(StatusCodes.OK).json({
      user,
      token,
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @desc Get an admin user's profile details
 * @route GET /api/v1/auth/admin/profile
 * @access Private
 */
const getAdminProfileDetails = async (req, res, next) => {
  try {
    const adminId = req.user.userId;
    const admin = await Admin.findOne({ _id: adminId });
    if (!admin) {
      throw new UnAuthenticatedError(
        "You are not authorized to perform this action"
      );
    }
    res.status(StatusCodes.OK).json({
      user: admin,
    });
  } catch (err) {
    next(err);
  }
};
/**
@desc Create a new company
@route POST /api/v1/admin/createCompany
@access Private
*/
// Define an asynchronous function called createCompany that takes in three parameters: req, res, and next
const createCompany = async (req, res, next) => {
  try {
    // Extract the user ID from the request object
    const userId = req.user.userId;
    // Check if the user is an admin
    const ifAdmin = await Admin.findOne({ _id: userId });
    if (!ifAdmin) {
      // If the user is not an admin, throw an UnAuthenticatedError with an error message
      throw new UnAuthenticatedError(
        "You are not authorized to create a company"
      );
    }
    // Extract the necessary fields from the request body
    const {
      name,
      email,
      password,
      website,
      description,
      logo,
      linkedin,
      address,
      programs,
      streams,
    } = req.body;
    // Extract the HR information from the request body
    const { hrName, hrEmail, hrPhone } = req.body;

    // Check if all required fields are provided
    if (
      !name ||
      !email ||
      !password ||
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
      // If any required field is missing, throw a BadRequestError with an error message
      throw new BadRequestError("Please provide all the required fields");
    }

    // Set the createdBy field of the request body to the user ID
    const createdBy = req.user.userId;

    // Create a new HR instance using the HR information from the request body
    const newHr = {
      name: hrName,
      email: hrEmail,
      phone: hrPhone,
    };

    // Create a new company instance with the saved HR instance as the HR field
    const newCompany = new Company({
      name,
      email,
      password,
      website,
      description,
      logo,
      linkedin,
      address,
      createdBy,
      streams,
      programs,
      hr: newHr,
    });

    // Check if a company with the same name or email already exists in the database
    const companyWithEmail = await Company.find({ email });
    const companyWithName = await Company.find({ name });
    if (companyWithName.length > 0 || companyWithEmail.length > 0) {
      // If a company with the same name or email exists, throw a BadRequestError with an error message
      throw new BadRequestError("Company already exists");
    }

    // Save the company instance to the database
    const savedCompany = await Company.create(newCompany);

    // Send a response to the client with a 201 (Created) status code, including the newly created company object with selected fields
    res.status(StatusCodes.CREATED).json({
      message: "Company created successfully",  
    });
  } catch (error) {
    // Call the next function with the error object
    next(error);
  }
};
export { createAdmin, updateAdmin, getAdminProfileDetails,createCompany };
