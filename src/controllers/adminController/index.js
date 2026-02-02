const login = require("./auth/login");
const profile = require("./auth/profile.js");
const update = require("./auth/update.js");
const register = require("./auth/register.js");
const verifyOTP = require("./forgetPass/verifyOTP.js");
const forgetPassword = require("./forgetPass/forgetPassword.js");
const resetPassword = require("./forgetPass/resetPassword.js");

module.exports = {
  login,
  profile,
  update,
  register,
  forgetPassword,
  verifyOTP,
  resetPassword,
};