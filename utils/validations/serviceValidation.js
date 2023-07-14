// const Joi = require("joi");

// //Service Validation
// const addServiceValidation = (data) => {
//   const schema = Joi.object({
//     title: Joi.string().min(5),
//     duration: Joi.number(),
//     categories: Joi.array(),
//     subtitles: Joi.array(),
//     banners: Joi.array(),
//     languages: Joi.array(),
//     dhaakadRating: Joi.string(),
//     ageGroup: Joi.array(),
//     casts: Joi.array(),
//     price: Joi.number(),
//     offerPrice: Joi.number(),
//     description: Joi.string(),
//     status: Joi.string(),
//   });
//   return schema.validate(data);
// };

// const updateServiceValidation = (data) => {
//   const schema = Joi.object({
//     title: Joi.string().min(5),
//     duration: Joi.number(),
//     categories: Joi.array(),
//     subtitles: Joi.array(),
//     banners: Joi.array(),
//     languages: Joi.array(),
//     dhaakadRating: Joi.string(),
//     ageGroup: Joi.array(),
//     casts: Joi.array(),
//     price: Joi.number(),
//     offerPrice: Joi.number(),
//     description: Joi.string(),
//     status: Joi.string(),
//   });
//   return schema.validate(data);
// };

// module.exports.addServiceValidation = addServiceValidation;
// module.exports.updateServiceValidation = updateServiceValidation;
