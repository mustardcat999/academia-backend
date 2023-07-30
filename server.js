import express from "express";
import morgan from "morgan";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db.js";
import adminRouter from "./routes/adminRoute.js";
import authRouter from "./routes/authRoute.js";
import companyRouter from "./routes/companyRoute.js";
import jobDriveRouter from "./routes/jobDriveRoute.js";
import studentAuthRouter from "./routes/studentRoute.js";
import notFoundMiddleware from "./middleware/not-found.js";
import errorHandlerMiddleware from "./middleware/error-handler.js";
import authenticateAdmin from "./middleware/authAdmin.js";
// Load environment variables from .env file
dotenv.config();

const app = express();

// Use morgan middleware in development environment for logging requests and responses
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

// Use cors middleware to allow cross-origin requests
app.use(cors());

// Parse incoming JSON data
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Mount auth routes at /api/v1/auth
app.use("/api/v1/auth", authRouter);

// Mount admin routes at /api/v1/admin
// Authenticate admin before accessing admin routes
app.use("/api/v1/admin", authenticateAdmin, adminRouter);

// Mount company routes at /api/v1/company
app.use("/api/v1/company", companyRouter);

// Mount student routes at /api/v1/auth
app.use("/api/v1/student", studentAuthRouter);

// Mount jobDrives routes at /api/v1/jobDrive
app.use("/api/v1/jobDrive", jobDriveRouter);

// Mount middleware for handling 404 not found errors
app.use(notFoundMiddleware);

// Mount middleware for handling all other errors
app.use(errorHandlerMiddleware);

const PORT = process.env.PORT || 5000;

// Connect to database and start the server
const start = async () => {
  try {
    await connectDB();
    app.listen(PORT, () => {
      console.log(
        `Server running in ${process.env.NODE_ENV} mode on http://localhost:${PORT}`
      );
    });
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
};

start();