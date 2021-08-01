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

// Index
router
    .route("/")
    // Show index page, at the moment only has a link
    // to all campgrounds in it.
    .get(catchAsync(campgrounds.index))
    // Create a new campground
    .post(isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// Show the new campground form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Specific campground
router
    .route("/:id")
    // View a specific campground
    .get(catchAsync(campgrounds.showCampground))
    // Update a campground
    .put(isLoggedIn, isAuthor, validateCampground, catchAsync(campgrounds.updateCampground))
    // Delete a campground
    .delete(isLoggedIn, isAuthor, catchAsync(campgrounds.deleteCampground));

// Show the campground edit form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

module.exports = router;
