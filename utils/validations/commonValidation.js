const customValidateForStatus = (value, helper) => {
  if (value === "user_admin" || value === "admin") {
    return value;
  }
  return helper.error("please enter valid position type user_admin/user");
};
module.exports.customValidateForStatus = customValidateForStatus;
