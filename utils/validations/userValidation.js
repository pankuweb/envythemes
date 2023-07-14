const Joi = require("joi");
const { customValidateForStatus } = require("./commonValidation");

// validate user type feild
const customValidateForPosition = (value, helper) => {
  if (value === "admin" || value === "user") {
    return value;
  }
  return helper.error("please enter valid user type");
};

//Registration Validation
const registerValidation = (data) => {
  const schema = Joi.object({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    email: Joi.string().required().email().message("Email is already exist"),
    password: Joi.string().required(),
    position: Joi.string().required(),
  });
  return schema.validate(data);
};

//Login Validation
const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().required().email(),
    password: Joi.string().required(),
    position: Joi.string().required(),
  });
  return schema.validate(data);
};

// Create User Validation
const createUserValidation = (data) => {
  const schema = Joi.object({
    userName: Joi.string(),
    email: Joi.string().required().email(),
    password: Joi.string(),
    position: Joi.string().email(),
    mobile: Joi.number(),
    gender: Joi.string(),
    city: Joi.string(),
  });
  return schema.validate(data);
};

//Update User Validation
const updateUserValidation = (data) => {
  const schema = Joi.object({
    userName: Joi.string(),
    email: Joi.string(),
    password: Joi.string(),
    position: Joi.string().email(),
    mobile: Joi.number(),
    gender: Joi.string(),
    city: Joi.string(),
  });
  return schema.validate(data);
};

module.exports.registerValidation = registerValidation;
module.exports.loginValidation = loginValidation;
module.exports.updateUserValidation = updateUserValidation;
module.exports.createUserValidation = createUserValidation;
