const express = require("express");
const contactController = require("../controllers/contactController");
const authController = require("./../controllers/authController");

const router = express.Router();

router
  .route("/")
  .post(contactController.createContact)
  .get(contactController.getAllContact);

module.exports = router;
