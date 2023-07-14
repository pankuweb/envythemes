const Image = require("./../models/profileModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const multer = require("multer");
const sharp = require("sharp");

// -----------------
//Route handdlers
// -----------------

//Resizing image
// -----------------------
const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new AppError("Not an image! Please upload only images.", 400), false);
  }
};

const upload = multer({
  storage: multerStorage,
  fileFilter: multerFilter,
});

const filterObj = (obj, ...allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((el) => {
    if (allowedFields.includes(el)) newObj[el] = obj[el];
  });
  return newObj;
};

exports.uploadUserPhoto = upload.single("image");

//Resizing Image

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
  if (!req.file) return next();
  const fileName = `image-profile-${Date.now()}.png`;
  const filePath = "public/img/images";

  await sharp(req.file.buffer)
    // .resize(500, 500)
    .toFormat("png")
    .png({ quality: 90 })
    .toFile(`${filePath}/${fileName}`);

  req.body.image = `${process.env.BASE_URL}/img/images/${fileName}`;
  next();
});

//RouteImagehanddlers

// Upload images ----
// -----------------------
exports.createImage = catchAsync(async (req, res) => {
  //Validate Data
  const { error } = req.body;
  if (error)
    return res.status(400).json({ error: true, msg: error.details[0].message });

  const images = await Image.create(req.body);

  res.status(201).json({
    status: "success",
    data: {
      images,
    },
  });
});
