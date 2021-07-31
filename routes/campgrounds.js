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
router.get("/", catchAsync(campgrounds.index));

// Show the new campground form
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Create a new Campground
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// View a specific campground
router.get("/:id", catchAsync(campgrounds.showCampground));

// Show the campground edit form
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(campgrounds.renderEditForm));

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
