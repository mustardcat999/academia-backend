import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
const studentSchema = mongoose.Schema({
  role: {
    type: String,
    required: true,
    default: "student",
  },
  applicationStatus: {
    type: String,
    default: "unverified",
  },
  enrollmentNo: {
    type: String,
    required: true,
    unique: true,
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
  about:{
    type: String,
  },
  password: {
    type: String,
    required: [true, "Please provide password"],
    minlength: 8,
    select: false,
  },
  placementDetails: {
    selected: {
      type: Boolean,
      default: false,
    },
    selectedIn: {
      company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Company",
      },
      jobProfile: {
        type: String,
      },
      package: {
        type: Number,
      }
    },
    appliedIn: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
      },
    ],
    rejectedFrom: [
      {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Company",
      },
    ],
  },
  personalDetails: {
    profileImage: {
      type: String,
    },
    dob: {
      type: Date,
    },
    gender: {
      type: String,
      enum: ["Male", "Female", "Other"],
    },
    contactNo: {
      type: String,
      validate: {
        validator: validator.isMobilePhone,
        message: "Please provide valid phone number",
      },
      minlength: 10,
      maxlength: 10,
    },
    aadharNo: {
      type: String,
      minlength: 12,
      maxlength: 12,
    },
    program: {
      type: String,
      enum: ["B.Tech", "M.Tech", "MBA", "MCA", "BBA", "BCA", "B.Sc", "M.Sc"],
    },
    stream: {
      type: String,
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
    collegeName: {
      type: String,
    },
    universityName: {
      type: String,
    },
    fatherName: {
      type: String, //for verification
    },
    motherName: {
      type: String, //for verification
    },
    currentAddress: {
      type: String,
    },
    permanentAddress: {
      type: String,
    },
    homeCity: {
      type: String,
    },
    homeState: {
      type: String,
    },
    homeCountry: {
      type: String,
    },
    pincode: {
      type: String,
    },
  },
  academicDetails: [
    {
      degree: {
        type: String,
      },
      specialization: {
        type: String,
      },
      institute: {
        type: String,
      },
      yearOfPassing: {
        type: Number,
      },
      board: {
        type: String,
      },
      result: {
        option: {
          type: String,
          enum: ["CGPA", "Percentage"],
        },
        value: {
          type: Number,
        },
      },
      numberOfSemesters: {
        type: Number,
      },
      backlogSubjects: {
        type: Number,
      },
    },
  ],
  professionalDetails: {
    experiences: [
      {
        companyName: {
          type: String,
        },
        designation: {
          type: String,
        },
        duration: {
          type: Number, //in months
        },
        location: {
          type: String,
        },
        jobDescription: {
          type: String,
        },
        from: {
          type: Date,
        },
        to: {
          type: Date,
        },
      },
    ],
    projects: [
      {
        projectName: {
          type: String,
        },
        projectDescription: {
          type: String,
        },
        sourceCodeLink: {
          type: String,
          validate: {
            validator: validator.isURL,
            message: "Please provide valid URL",
          },
        },
        liveLink: {
          type: String,
          validate: {
            validator: validator.isURL,
            message: "Please provide valid URL",
          },
        },
      },
    ],
    skills: {
      type: [String],
    },
    certifications: [
      {
        certificationName: {
          type: String,
        },
        certificationAuthority: {
          type: String,
        },
        certificationLink: {
          type: String,
          validate: {
            validator: validator.isURL,
            message: "Please provide valid URL",
          },
        },
      },
    ],
    links: {
      type: [String],
    },
  },
  documents: {
    resume: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "Please provide valid URL",
      },
    },
    photo: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "Please provide valid URL",
      },
    },
    aadhar: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "Please provide valid URL",
      },
    },
    allDocument: {
      type: String,
      validate: {
        validator: validator.isURL,
        message: "Please provide valid URL",
      },
    },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});
// Hash password before saving the user
studentSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(
    this.password,
    salt
  );
});

// Create a JWT token for the user
studentSchema.methods.createJWT = function () {
  return jwt.sign({ userId: this._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_LIFETIME,
  });
};

// Compare user password with hashed password
studentSchema.methods.comparePassword = async function (candidatePassword) {
  const isMatch = await bcrypt.compare(
    candidatePassword,
    this.password
  );
  return isMatch;
};
export default mongoose.model("Student", studentSchema);
