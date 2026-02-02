const updateUserProfile = require("./auth/profile.js");
const updateProfile = require("./auth/updateProfile.js");
const sendOTP = require("./auth/sendOTP.js");
const verifyOTP = require("./auth/verifyOTP.js");
const signup = require("./auth/signup.js");
const login = require("./auth/login.js");
const getUserById = require("./auth/getUser.js");
const getAllUsers=require("./auth/getAllUser.js");
const changePassword = require("./auth/updatePassword.js");
module.exports = {
    updateUserProfile,
    changePassword,
    updateProfile,
    sendOTP,
    verifyOTP,
    signup,
    login,
    getUserById,
    getAllUsers,
   
};

