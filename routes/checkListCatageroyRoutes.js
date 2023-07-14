const express = require("express");
const checkListCatageroyController = require("../controllers/checkListCatageroyController");

const router = express.Router();

router
  .route("/")
  .post(checkListCatageroyController.createchecklistParent)
  .get(checkListCatageroyController.getAllchecklistParent);

router
  .route("/:id")
  .patch(checkListCatageroyController.updatechecklistParent)
  .delete(checkListCatageroyController.deletechecklistparent);

module.exports = router;
