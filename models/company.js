import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const hrSchema = mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please provide HR name"],
    minlength: 3,
    maxlength: 50,
  },
  email: {
    type: String,
    required: [true, "Please provide HR email"],
  },
  phone: {
    type: String,
    validate: {
      validator: validator.isMobilePhone,
      message: "Please provide valid phone number",
    },
    minlength: 10,
    maxlength: 10,
  },
});

const companySchema = mongoose.Schema({
  role: {
    type: String,
    required: true,
    default: "company",
  },
  name: {
    type: String,
    required: [true, "Please provide company name"],
    minlength: 3,
    maxlength: 50,
    unique: true,
  },
  email: {
    type: String,
    required: [true, "Please provide company email"],
    unique: true,
  },
  password: {
    type: String,
    required: [true, "Please provide company password"],
    minlength: 8,
    select: false,
  },
  website: {
    type: String,
  },
  description: {
    type: String,
    required: true,
    minlength: 10,
    maxlength: 1000,
  },
  logo: {
    type: String,
    required: true,
  },
  linkedin: {
    type: String,
  },
  address: {
    type: String,
    required: [true, "Please provide company address"],
  },
  hr: hrSchema,
  programs: {
    type: [String],
    required: [true, "Please provide program"],
    enum: ["B.Tech", "M.Tech", "MBA", "MCA", "BBA", "BCA", "B.Sc", "M.Sc"],
  },
  streams: {
    type: [String],
    required: [true, "Please provide streams"],
    enum: [
      "Computer Science",
      "Electronics",
      "Mechanical",
      "Civil",
      "Electrical",
      "Agriculture",
      "Mining",
      "Chemical",
      "Biotechnology",
      "Food Technology",
      "Textile",
    ],
  },
  placementDrives: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "JobDrive",
    },
  ],
  createdBy: {
    type: mongoose.Types.ObjectId,
    ref: "Admin",
    required: [true, "Please login"],
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Hash password before saving the user
companySchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Create a JWT token for the user
companySchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

// Compare user password with hashed password
companySchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(candidatePassword, this.password);
  return isMatch;
};

export default mongoose.model("Company", companySchema);
