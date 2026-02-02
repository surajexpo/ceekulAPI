const router = require("express").Router();
const passport = require("passport");
const { generateToken } = require("../utils");


// Google OAuth routes
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

router.get("/google/callback",passport.authenticate("google", {failureRedirect: "/login",session: true }),
  async (req, res) => {
    const token = await generateToken(req.user.id, "user");
    res.status(200).json({
      status: true,
      message: "Login Successful",
      user: req.user,
      token,
    });
  }
);

router.get("/logout", (req, res) => {
  req.logout(err => {
    if (err) {
      return res.status(500).json({
        status: false,
        message: "Logout failed",
        error: err.message
      });
    }

    req.session.destroy(() => {
      res.clearCookie("connect.sid"); // Optional: clear session cookie
      res.status(200).json({
        status: true,
        message: "Logged out successfully"
      });
    });
  });
});

module.exports = router;