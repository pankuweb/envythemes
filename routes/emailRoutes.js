const express = require("express");
const emailController = require("../controllers/emailController");

const router = express.Router();

router.route("/").post(emailController.createEmail);
router.post("/sendOtp", emailController.sendOtp);
router.patch("/verifyOTP", emailController.verifyOTP);

module.exports = router;
