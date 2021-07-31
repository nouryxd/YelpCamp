const express = require("express");
const router = express.Router({ mergeParams: true });

// Helpers
const catchAsync = require("../utils/catchAsync");

// Middleware
const { validateReview } = require("../middleware");
const { isLoggedIn } = require("../middleware");

// Models
const Review = require("../models/review");
const Campground = require("../models/campground");

router.post(
    "/",
    isLoggedIn,
    validateReview,
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        review.author = req.user._id;
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        req.flash("success", "Successfully posted a review.");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:reviewId",
    catchAsync(async (req, res) => {
        const { id, reviewId } = req.params;
        await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
        await Review.findByIdAndDelete(reviewId);
        req.flash("success", "Successfully deleted a review.");
        res.redirect(`/campgrounds/${id}`);
    })
);

module.exports = router;
