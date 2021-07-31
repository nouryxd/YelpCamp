const express = require("express");
const router = express.Router();

// Helpers
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");

// Middleware
const { isLoggedIn } = require("../middleware");
const { validateCampground } = require("../middleware");
const { isAuthor } = require("../middleware");

// Models
const Campground = require("../models/campground");

const { campgroundSchema } = require("../schemas");

router.get(
    "/",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

router.get("/new", isLoggedIn, (req, res) => {
    res.render("campgrounds/new");
});

router.get(
    "/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id).populate("reviews").populate("author");
        // console.log(campground);
        if (!campground) {
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        }
        // console.log(campground);
        res.render("campgrounds/show", { campground });
    })
);

router.post(
    "/",
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res, next) => {
        const campground = new Campground(req.body.campground);
        campground.author = req.user._id;
        await campground.save();
        req.flash("success", "Successfully created a new campground");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.get(
    "/:id/edit",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        }

        res.render("campgrounds/edit", { campground });
    })
);

router.put(
    "/:id",
    isLoggedIn,
    isAuthor,
    validateCampground,
    catchAsync(async (req, res) => {
        const campground = await Campground.findByIdAndUpdate(
            id,
            { ...req.body.campground },
            { useFindAndModify: false }
        );
        req.flash("success", "Successfully updated a campground.");
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

router.delete(
    "/:id",
    isLoggedIn,
    isAuthor,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        // console.log(campground)
        req.flash("success", "Successfully deleted a campground.");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
