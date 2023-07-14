const express = require("express");
const profileController = require("../controllers/profileController");
const multer = require("multer");

const router = express.Router();
const authController = require("../controllers/authController");
var upload = multer({ dest: "./upload/" });

// app.post("/post", upload.single("file"), function (req, res) {
//   console.log(req.file);
//   res.send("file saved on server");
// });

router
  .route("/")
  .post(
    profileController.uploadUserPhoto,
    profileController.resizeUserPhoto,
    profileController.createImage
  );

module.exports = router;
