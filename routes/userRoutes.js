const router = require("express").Router();
const verifyToken = require("../middlewares/verifyToken");
const usersController = require("../controllers/usersController");
const multer = require("multer");
const appError = require("../utils/appError");

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log("FILE ", file);
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    const ext = file.mimetype.split("/")[1];
    const fileName = `user-${Date.now()}.${ext}`;
    cb(null, fileName);
  },
});

const fileFilter = (req, file, cb) => {
  const imageType = file.mimetype.split("/")[0];
  if (imageType === "image") {
    return cb(null, true);
  } else {
    return cb(appError.create("file must be an image", 400), false);
  }
};

const upload = multer({ storage: diskStorage, fileFilter });
// get all users
// register
// login

router.route("/").get(verifyToken, usersController.getAllUsers); // get all users
router.post("/register", upload.single("avatar"), usersController.register);
router.post("/login", usersController.login);

module.exports = router;
