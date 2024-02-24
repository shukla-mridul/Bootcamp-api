const express = require("express");
const {
  register,
  login,
  getme,
  forgotPassword,
  resetPassword,
} = require("../controller/auth");
const { protect } = require("../middleware/auth");
const { route } = require("./courses");

const router = express.Router();

router.route("/register").post(register);
router.route("/login").post(login);
router.route("/me").post(protect, getme);
router.route("/forgotpassword").post(forgotPassword);
router.route("/resetpassword/:resettoken").put(resetPassword);

module.exports = router;
