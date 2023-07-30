// Import required modules
import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Create a new mongoose schema for Admin
const adminSchema = mongoose.Schema({
  role: {
    type: String,
    required: true,
    default: "admin",
  },
  name: {
    type: String,
    required: [true, "Please provide name"],
    minlength: 3,
    maxlength: 20,
  },
  email: {
    type: String,
    required: [true, "Please provide email"],
    validate: {
      validator: validator.isEmail,
      message: "Please provide valid email",
    },
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 8,
    select: false,
  },
  avatar: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["Male", "Female", "Others"],
  },
  designation: {
    type: String,
    minlength: 3,
    maxlength: 100,
  },
  phone: {
    type: String,
    validate: {
      validator: validator.isMobilePhone,
      message: "Please provide valid mobile number",
    },
    minlength: 10,
    maxlength: 10,
    // match: /((+)((0[ -])|((91 )))((\d{12})+|(\d{10})+))|\d{5}([- ]*)\d{6}/,
  },
  aadharno: {
    type: String,
    minlength: 12,
    maxlength: 12,
    //match: /^[2-9]{1}[0-9]{3}\\s[0-9]{4}\\s[0-9]{4}$/,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Hash password before saving the user
adminSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Create a JWT token for the user
adminSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

// Compare user password with hashed password
adminSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

// Export mongoose model for Admin
export default mongoose.model("Admin", adminSchema);
