const catchAsync = require("../utils/catchAsync");
const Email = require("../models/emailModel");
const AppError = require("../utils/appError");
const sendEmail = require("./../utils/email");
const User = require("./../models/userModel");
// const io = require("../server");

const signToken = (id) => {
  //
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// -----------------
//Route handdlers
// -----------------

// Get all contacts of enquiery
// -----------------------
exports.createEmail = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const newEmail = await Email.create({ email: req.body.email });

  if (
    /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/.test(
      req.body.email
    ) === false
  ) {
    return next(new AppError("Please enter a valid email!", 400));
  }

  const user = await User.find();
  const { email } = req.body;

  const users = await User.findOne({ email });

  if (users) {
    return next(new AppError("Email already exists!", 400));
  }

  io.emit("contact-added", newEmail);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      email: newEmail,
    },
  });
});
exports.sendOtp = catchAsync(async (req, res, next) => {
  // 1) Get user based on POSTed email
  const user = await Email.findOne({ email: req.body.email });

  if (!user) {
    return next(new AppError("There is no user with email address.", 404));
  }

  // GEN OTP
  const otp = Math.floor(1000 + Math.random() * 9000);
  const expiryotp = new Date(Date.now() + 20 * 3000);
  user.otp = otp;
  user.expiryotp = expiryotp;

  // 2) Generate the random reset token
  // const resetToken = user.createPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const message = `Your Roadside Response Verification Email OTP is: ${otp}.`;

  try {
    await sendEmail({
      email: user.email,
      message,
    });
    res.status(200).json({
      status: "success",
      message: "OTP sent to email!",
    });
  } catch (err) {
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }
});

exports.verifyOTP = catchAsync(async (req, res) => {
  const crunenttime = Date.now();

  const matchotp = await Email.findOne({ email: req.body.email });

  if (matchotp.expiryotp < crunenttime) {
    return res.status(401).json({
      status: "false",
      message: "OTP Expired!",
    });
  }
  if (matchotp.otp === req.body.otp) {
    return res.status(200).json({
      id: matchotp._id,
      status: "success",
      message: "OTP verified successfully!",
    });
  } else {
    return res.status(400).json({
      status: "error",
      message: "Please try again",
    });
  }
});
