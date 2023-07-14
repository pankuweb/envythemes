const express = require("express");
const authController = require("./../controllers/authController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.get("/logout", authController.logout);
router.post("/generateLink", authController.generateLink);
router.post("/sendMessage", authController.sendMessage);

router.post("/sendForgotPasswordOTP", authController.sendForgotOTP);
router.post("/verfifyForgotPasswordOTP", authController.verifyForgotOTP);
router.patch("/resetPassword/:id", authController.resetPassword);
router.post("/resendOTP", authController.resendOTP);
router.patch("/updatePassword/:id", authController.updatePassword);

router.patch("/uploadToken/:id", userController.addToken);

router.post("/googlelogin", authController.googlelogin);
router.post("/googlesignup", authController.googlesignup);

router.post("/sendOTP", authController.validateUserSignUp);
router.post("/verifyOTP", authController.otpvalidation);

router.post("/staff/sendOTP", authController.sendLogninOTP);
router.post("/staff/verifyOTP", authController.verifyLoginOTP);

router
  .route("/")
  .get(userController.getAllUsers)
  .post(userController.createUser);

router
  .route("/purchaseMembership/:id")
  .patch(userController.purchaseMembership);
router.route("/updatePass").patch(authController.updatePass);
router.route("/matchOTP").patch(authController.matchOTP);
router.route("/changePass").patch(authController.changePass);

router.route("/filter").get(userController.getFilteredUsers);
router.patch("/updateOrderCounts/:id", userController.updateOrderCounts);

router.route("/filterbystatus").get(userController.getFilteredStatus);
router.route("/deleteUserAddress/:id").patch(userController.deleteUserAddress);
router.route("/deleteUserVehicle/:id").patch(userController.deleteUserVehicle);

router.route("/updateUserAddress/:id").patch(userController.updateUserAddress);
router.route("/updateUserVehicle/:id").patch(userController.updateUserVehicle);
router.route("/addUserAddress/:id").patch(userController.addUserAddress);
router
  .route("/:id")
  .get(userController.getUserByUn)
  .patch(userController.updateUser)
  .delete(userController.deleteUser);
router.route("/user/:id").get(userController.getUser);
router.route("/multiUser/:id").delete(userController.deleteMuliUser);

// Dependant
router.route("/getAllDependants/:id").get(userController.getAllDependants);
router.route("/getDependants/:id").get(userController.getDependants);

module.exports = router;
