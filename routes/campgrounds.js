const express = require("express");
const router = express.Router();

// Controllers
const campgrounds = require("../controllers/campgrounds");

// Helpers
const catchAsync = require("../utils/catchAsync");

// Middleware
const { isLoggedIn } = require("../middleware");
const { validateCampground } = require("../middleware");
const { isAuthor } = require("../middleware");

// Models
const Campground = require("../models/campground");

// Index
// http://localhost:8080/
router.get("/", catchAsync(campgrounds.index));

// Show the new campground form
// http://localhost:8080/campgrounds/new
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Create a new Campground
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// View a specific campground
// http://localhost:8080/campgrounds/61035cc80b22ffed75596f00
router.get("/:id", catchAsync(campgrounds.showCampground));

// Show the campground edit form
// http://localhost:8080/campgrounds/6105d57ec33a244128a2bdaa/edit
http: router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

// Update a campground
router.put(
    "/:id",
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(campgrounds.updateCampground)
);

// Delete a campground
router.delete("/:id", isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

module.exports = router;
