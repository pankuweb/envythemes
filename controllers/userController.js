const User = require("./../models/userModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const APIFeatures = require("./../utils/apiFeatures");
const Users = require("../models/userModel");
const jwt = require("jsonwebtoken");
const sendEmail = require("./../utils/email");
const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

// -----------------
// -----------------
//Route handdlers
// --------------------

// Get all users ----
// -----------------------
exports.getAllUsers = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  const users = await User.find().sort({ $natural: -1 });
  io.emit("user-list", users);

  res.status(200).json({
    message: "success",
    message: "Users fetched successfully!",
    results: users.length,
    data: {
      users: users,
    },
  });
});

// Get all active users ----
// -----------------------
exports.getFilteredStatus = catchAsync(async (req, res, next) => {
  let filterdata = await User.find();
  let result = filterdata.filter((item) => item.status == "active");

  res.status(200).json({
    length: result.length,
    status: "success",
    message: "status fetched successfully",
    data: {
      result,
    },
  });
});

// Filtered Users ----
// -----------------------
exports.getFilteredUsers = catchAsync(async (req, res, next) => {
  let query = {};

  query.position = { $regex: req.query["position"] };
  const positions = new APIFeatures(User.find(), query)
    .filter()
    .sort()
    .limitFields()
    .paginate();

  const filteredUser = await positions.query;
  res.status(200).json({
    length: filteredUser.length,
    status: "success",
    data: {
      filteredUser,
    },
  });
});

// Create new user ----
// -----------------------
exports.createUser = catchAsync(async (req, res) => {
  const io = req.app.get("io");

  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  req.body.user_id = req.body.password;

  const users = await User.create(req.body);

  res.status(201).json({
    status: "success",
    message: "created successfully!",
    data: {
      users,
    },
  });
});

// Update user ----
// -----------------------
exports.updateUser = catchAsync(async (req, res, next) => {
  //Validate Data
  const filteredBody = filterObj(req.body);
  if (req.file) filteredBody.photo = req.file.filename;

  let userData = { ...filteredBody, ...req.body };
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }
  const updates = Object.keys(userData);
  updates.forEach((update) => (user[update] = userData[update]));
  await user.save();

  res.status(200).json({
    status: "success",
    message: `Customer updated successfully`,
    data: {
      user,
    },
  });
});

exports.updatePass = catchAsync(async (req, res, next) => {
  const { email, password, position } = req.body;
  const user = await User.findOne({ email, position }).select("+password");

  if (!user || !(await user.correctPassword(password, user.password))) {
    return next(new AppError("Incorrect email or password", 401));
  }

  //
  const filteredBody = filterObj(req.body);
  if (req.file) filteredBody.photo = req.file.filename;

  const data = req.body;

  data.password = req.body.confirmPass;
  let userData = { ...filteredBody, ...data };

  const updates = Object.keys(userData);
  updates.forEach((update) => (user[update] = userData[update]));
  await user.save();
  //

  res.status(200).json({
    status: "success",
    message: `Customer updated successfully`,
    data: {
      user,
    },
  });
});
// Update order counts of purchased membership of user ----
// -----------------------
exports.updateOrderCounts = catchAsync(async (req, res, next) => {
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const userData = await User.findById(req.params.id);

  userData.purched_memberships.map(
    (item) => (item._id = `ObjectId(${req.body._id})`)
  );
  const Useroldmem = userData.purched_memberships.filter(
    (item) => item._id == req.body._id
  );

  const UserAdd = userData.purched_memberships.filter(
    (item) => item._id != req.body._id
  );

  Useroldmem[0].placedOrders = req.body.placedOrders;
  Useroldmem[0].expired = req.body.expired;

  UserAdd.push(Useroldmem[0]);
  userData.purched_memberships = UserAdd;

  if (
    Useroldmem[0].allowedOrders == Useroldmem[0].placedOrders ||
    Useroldmem[0].allowedOrders < Useroldmem[0].placedOrders
  ) {
    const customer = await User.findById(req.params.id);

    customer.purched_memberships.map(
      (item) => (item._id = `ObjectId(${req.body._id})`)
    );
    const Customeroldmem = customer.purched_memberships.filter(
      (item) => item._id == req.body._id
    );

    const UserAdd = customer.purched_memberships.filter(
      (item) => item._id != req.body._id
    );
    UserAdd.push(Customeroldmem[0]);
    customer.purched_memberships = UserAdd;
    Customeroldmem[0].expired = true;
    Customeroldmem[0].placedOrders = Customeroldmem[0].allowedOrders;
    const user = await User.findByIdAndUpdate(req.params.id, customer, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: "error",
      message: "Your membership is expired!",
    });
  } else {
    const user = await User.findByIdAndUpdate(req.params.id, userData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError("No user found with that ID", 404));
    }

    res.status(200).json({
      status: "success",
      message: "updated successfully",
      data: {
        userData,
      },
    });
  }
});

// add user address ----
// -----------------------
exports.addUserAddress = catchAsync(async (req, res, next) => {
  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const userData = await User.findById(req.params.id);

  userData.address.push(req.body);
  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      userData,
    },
  });
});

// Update user address ----
// -----------------------
exports.updateUserAddress = catchAsync(async (req, res, next) => {
  //Validate Data
  // const { error } = req.body;
  // if (error)
  //   return res.status(400).json({ error: true, msg: error.details[0].message });

  // const userData = await User.findById(req.params.id);

  // const UserAdd = userData.address.filter((item) => item);
  // const bodyData = [req.body];
  // const updatedUserAdd = bodyData.map(
  //   (obj) => UserAdd.find((o) => o._id === obj._id) || obj
  // );

  // userData.address = updatedUserAdd;
  // const user = await User.findByIdAndUpdate(req.params.id, userData, {
  //   new: true,
  //   runValidators: true,
  // });
  // if (!user) {
  //   return next(new AppError("No user found with that ID", 404));
  // }

  // res.status(200).json({
  //   status: "success",
  //   message: "updated successfully",
  //   data: {
  //     userData,
  //   },
  // });
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const userData = await User.findById(req.params.id);
  const test = userData.address.map(
    (item) => (item._id = `ObjectId(${req.body._id})`)
  );

  const UserAdd = userData.address.filter((item) => item._id != req.body._id);
  UserAdd.push(req.body);
  userData.address = UserAdd;

  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      userData,
    },
  });
});

// Update user vehicle -----
// -----------------------
exports.updateUserVehicle = catchAsync(async (req, res, next) => {
  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const userData = await User.findById(req.params.id);
  userData.vehicle.map((item) => (item._id = `ObjectId(${req.body._id})`));

  const UserAdd = userData.vehicle.filter((item) => item._id != req.body._id);
  UserAdd.push(req.body);
  userData.vehicle = UserAdd;

  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      userData,
    },
  });
});

// Purchase a membership ----
// -----------------------
exports.purchaseMembership = catchAsync(async (req, res, next) => {
  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const users = await User.findById(req.params.id);

  users.purched_memberships.find((subItem) => {
    subItem.expired = "true";
  });

  await User.findByIdAndUpdate(req.params.id, users, {
    new: true,
    runValidators: true,
  });

  const userData = await User.findById(req.params.id);
  userData.purched_memberships.map(
    (item) => (item._id = `ObjectId(${req.body._id})`)
  );

  const UserAdd = userData.purched_memberships.filter(
    (item) => item._id != req.body._id
  );

  UserAdd.push(req.body);
  userData.purched_memberships = UserAdd;

  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      userData,
    },
  });
});

// Delete user address ----
// -----------------------
exports.deleteUserAddress = catchAsync(async (req, res, next) => {
  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const userData = await User.findById(req.params.id);

  const deletedUserAdd = userData.address.filter(
    (item) => item.id !== req.body.addressId
  );

  userData.address = deletedUserAdd;
  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      user,
    },
  });
});

// Delete user vehicle ----
// -----------------------
exports.deleteUserVehicle = catchAsync(async (req, res, next) => {
  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const userData = await User.findById(req.params.id);

  const deletedUserVeh = userData.vehicle.filter(
    (item) => item.id !== req.body.vehicleId
  );

  userData.vehicle = deletedUserVeh;
  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      user,
    },
  });
});

// Delete user ----
// -----------------------
exports.deleteUser = catchAsync(async (req, res, next) => {
  const users = await User.findByIdAndDelete(req.params.id);

  if (!users) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    data: {
      message: "user deleted successfully!",
    },
  });
});

// Get user by id ----
// -----------------------
exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id);

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      user,
    },
  });
});

exports.getUserByUn = catchAsync(async (req, res, next) => {
  const user = await User.find({ unique_id: req.params.id });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "fetched successfully!",
    data: {
      user,
    },
  });
});

// Add Token ----
// -----------------------
exports.addToken = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      user,
    },
  });
});

// -----------------
// -----------------
//Dependant Functionality
// --------------------

// Get all dependants ----
// -----------------------
exports.getAllDependants = catchAsync(async (req, res) => {
  const users = await User.find({ parent_user_id: req.params.id }).sort({
    $natural: -1,
  });

  res.status(200).json({
    message: "success",
    message: "Users fetched successfully!",
    results: users.length,
    data: {
      users: users,
    },
  });
});

exports.getDependants = catchAsync(async (req, res, next) => {
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const users = await User.findById(req.params.id);

  await User.findByIdAndUpdate(req.params.id, users, {
    new: true,
    runValidators: true,
  });

  const userData = await User.findById(req.params.id);

  const user = await User.findByIdAndUpdate(req.params.id, userData, {
    new: true,
    runValidators: true,
  });

  if (!user) {
    return next(new AppError("No user found with that ID", 404));
  }

  res.status(200).json({
    status: "success",
    message: "updated successfully",
    data: {
      userData,
    },
  });
});

// Delete order  ----
exports.deleteMuliUser = catchAsync(async (req, res) => {
  const id = req.params.id;

  var idArray = id.split(",");

  idArray.forEach(async (_id) => {
    await User.deleteMany({ _id: { $in: _id } });
  });

  res.status(200).json({
    status: "success",
    message: "Users delete successfully!",
  });
});
