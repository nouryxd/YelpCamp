const express = require("express");
const router = express.Router({ mergeParams: true });

// Helpers
const catchAsync = require("../utils/catchAsync");

// Middleware
const { validateReview } = require("../middleware");
const { isLoggedIn } = require("../middleware");
const { isReviewAuthor } = require("../middleware");

// Controller
const reviews = require("../controllers/reviews");

// Create a new review
router.post("/", isLoggedIn, validateReview, catchAsync(reviews.createReview));

// Delete a review
router.delete("/:reviewId", isLoggedIn, isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
