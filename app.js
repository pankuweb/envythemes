const express = require("express");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const xss = require("xss-clean");
const hpp = require("hpp");
const cors = require("cors");
const cookieParser = require("cookie-parser");

const AppError = require("./utils/appError");
const globalErrorHandler = require("./controllers/errorController");
const passport = require("passport");
const userRouter = require("./routes/userRoutes");
const contact = require("./routes/contactRoutes");
const image = require("./routes/profileRoutes");
const emailRoutes = require("./routes/emailRoutes");
const checkListCatageroyRoutes = require("./routes/checkListCatageroyRoutes");

const app = express();

require("./utils/passport");

// 1) GLOBAL MIDDLEWARES
// Set security HTTP headers
app.use(helmet());
app.set("view engine", "ejs");

// Development logging
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
}

app.use(cors());

app.use(cookieParser());

//usepassport
app.use(passport.initialize());

// Limit requests from same API
// const limiter = rateLimit({
//   max: 500,
//   windowMs: 60 * 60 * 1000,
//   message: "Too many requests from this IP, please try again in an hour!",
// });

// app.use("/api", limiter);

// Body parser, reading data from body into req.body
app.use(express.json({ limit: "10kb" }));

// Data sanitization against NoSQL query injection
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// Prevent parameter pollution
app.use(
  hpp({
    whitelist: [
      "duration",
      "ratingsQuantity",
      "ratingsAverage",
      "maxGroupSize",
      "difficulty",
      "price",
    ],
  })
);

// Serving static files
app.use(express.static(`${__dirname}/public`));

// Test middleware
app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  // console.log(req.headers);
  next();
});

app.use(express.json());

// 3) ROUTES
app.use("/api/v1/users", userRouter);
app.use("/api/v1/contact", contact);
app.use("/api/v1/image", image);
app.use("/api/v1/email", emailRoutes);
app.use("/api/v1/checkListCat", checkListCatageroyRoutes);

app.all("*", (req, res, next) => {
  next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;
