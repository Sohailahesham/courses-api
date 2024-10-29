require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const cors = require("cors");

const coursesRouter = require("./routes/coursesRoutes");
const userRouter = require("./routes/userRoutes");

const httpStatusText = require("./utils/httpStatusText");

// console.log("env:", process.env);

const uri = process.env.MONGO_URI;

mongoose.connect(uri).then(() => console.log("mongodb server started"));

app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.json());
app.use(cors());

//CRUD (Create / Read / Update / Delete)

//Route --> Resource

app.use("/api/courses", coursesRouter);
app.use("/api/users", userRouter);

//Global MiddleWare for not found router
app.all("*", (req, res, next) => {
  res.status(404).json({
    status: httpStatusText.ERROR,
    message: "this resource is not available",
  });
}); // Wild card

//Global Error Handler
app.use((error, req, res, next) => {
  res.status(error.statusCode || 500).json({
    status: error.statusText || httpStatusText.ERROR,
    message: error.message,
    code: error.statusCode || 500,
    data: null,
  });
});

app.listen(process.env.PORT || 4000, () =>
  console.log("Listenning on port 5000")
);
