const router = require("express").Router();
const { validationSchema } = require("../middlewares/validationSchema");
const coursesController = require("../controllers/coursesController");
const verifyToken = require("../middlewares/verifyToken");
const userRoles = require("../utils/userRoles");
const allowedTo = require("../middlewares/allowedTo");

router
  .route("/")
  .get(coursesController.getAllCourses) // get all courses
  .post(
    verifyToken,
    allowedTo(userRoles.MANGER),
    validationSchema(),
    coursesController.createCourse
  ); // create new course

router
  .route("/:id")
  .get(coursesController.getCourse) // get single course
  .patch(coursesController.updateCourse) // update a course
  .delete(
    verifyToken,
    allowedTo(userRoles.ADMIN, userRoles.MANGER),
    coursesController.deleteCourse
  ); // delete a course

module.exports = router;
