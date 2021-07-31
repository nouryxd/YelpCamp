const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const passport = require("passport");
const User = require("../models/user");

const users = require("../controllers/users");

// Show the register form
router.get("/register", users.renderRegister);

// Register a new user
router.post("/register", catchAsync(users.register));

// Show the login form
router.get("/login", users.renderLogin);

// Login a user
router.post(
    "/login",
    passport.authenticate("local", { failureFlash: true, failureRedirect: "/login" }),
    users.login
);

// Log a user out
router.get("/logout", users.logout);

module.exports = router;
