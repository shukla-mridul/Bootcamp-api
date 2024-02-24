const path = require("path");
const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv");
const fileUpload = require("express-fileupload");
const cookieParser = require("cookie-parser");

const bootcamps = require("./routes/bootcamps");
const courses = require("./routes/courses");
const auth = require("./routes/auth");
const connectDB = require("./config/db");

const ErrorHandler = require("./middleware/Error");

// const { logger } = require("./middleware/logger");

const morgan = require("morgan");
// Load env variables
connectDB();

dotenv.config({ path: "./config/config.env" });
const PORT = process.env.PORT || 3001;
const app = express();

// Body parser
app.use(express.json());

// Cookie parser
// app.use(cookieParser);

// if (process.env.NODE_ENV === "development") {
//   app.use(morgan("dev"));
// }

// Set static folder
app.use(express.static(path.join(__dirname, "public")));

// File uploader

app.use(fileUpload());

// Routes
app.use("/api/v1/bootcamps", bootcamps);
app.use("/api/v1/courses", courses);
app.use("/api/v1/auth", auth);
app.use(ErrorHandler);
app.listen(PORT, () => {
  console.log(`Server is running on ${PORT}`.yellow.bold);
});

// Handle unhandledd rejection with a new function

process.on("unhandledRejection", (err, promise) => {
  console.log(`Error : ${err.message}`.red.bold);
  // CLose the server and exit process
  server.close(() => process.exit(1));
});
