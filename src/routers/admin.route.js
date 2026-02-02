
const adminRoute = require("express").Router();
const { authenticateAdmin } = require("../middlewares");
const { login, profile, update, register, forgetPassword, verifyOTP, resetPassword } 
= require('../controllers/adminController');


adminRoute.post("/register", authenticateAdmin, register);

adminRoute.post("/login", login)
adminRoute.get("/profile", authenticateAdmin, profile);
adminRoute.put("/update", authenticateAdmin, update);

//forget password
adminRoute.post("/forgetPassword", forgetPassword);
adminRoute.post("/verifyOTP", verifyOTP);
adminRoute.post("/resetPassword", resetPassword);
//gks






module.exports = adminRoute;
