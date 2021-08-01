const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const User = require("../models/user");

const users = require("../controllers/users");

// Register
router
    .route("/register")
    // Show the register form
    .get(users.renderRegister)
    // Register a new user
    .post(catchAsync(users.register));

// Login
router
    .route("/login")
    // Show the login form
    .get(users.renderLogin)
    // Login a user
    .post(
        passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
        users.login
    );
// Log a user out
router.get("/logout", users.logout);

module.exports = router;
