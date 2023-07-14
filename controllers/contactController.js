const catchAsync = require("../utils/catchAsync");
const Contact = require("../models/contactModel");
const Email = require("../models/emailModel");
const AppError = require("../utils/appError");
const sendEmail = require("./../utils/email");

// const io = require("../server");

// -----------------
//Route handdlers
// -----------------

// Get all contacts of enquiery
// -----------------------
exports.getAllContact = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  const contact = await Contact.find().sort({ $natural: -1 });
  io.emit("contact-added", contact);

  res.status(200).json({
    message: "success",
    message: "Contact fetched successfully!",
    results: contact.length,

    data: {
      contact: contact,
    },
  });
});

// Create a enquiery contact
// -----------------------
exports.createContact = catchAsync(async (req, res, next) => {
  const io = req.app.get("io");

  const newContact = await Contact.create(req.body);
  const contact = await Contact.find().sort({ $natural: -1 });

  const message = `Someone requested: 
          Name: ${req.body.name},
          Email: ${req.body.email},
          Phone No: ${req.body.phone},
          Company: ${req.body.company},
          City: ${req.body.city},
          Message: ${req.body.message}
  .`;

  try {
    await sendEmail({
      email: "info@riskstifle.ca",
      message,
      contact: newContact,
    });
    res.status(200).json({
      status: "success",
      message: "mail sent!",
    });
  } catch (err) {
    await user.save({ validateBeforeSave: false });
    return next(
      new AppError("There was an error sending the email. Try again later!"),
      500
    );
  }

  // res.status(201).json({
  //   status: "success",
  //   message: "created successfully!",
  //   data: {
  //     contact: newContact,
  //   },
  // });
});
