const express = require("express");
const router = express.Router();

// Helpers
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { isLoggedIn } = require("../middleware");

// Models
const Campground = require("../models/campground");

const { campgroundSchema } = require("../schemas");
const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        console.log(error);
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    } else {
        next();
    }
};
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
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground) {
            req.flash("error", "Campground not found");
            return res.redirect("/campgrounds");
        }
        if (!campground.author.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that");
            return res.redirect(`/campgrounds/${id}`);
        }

        res.render("campgrounds/edit", { campground });
    })
);

router.put(
    "/:id",
    isLoggedIn,
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        if (!campground.author.equals(req.user._id)) {
            req.flash("error", "You do not have permission to do that");
            return res.redirect(`/campgrounds/${id}`);
        }
        const camp = await Campground.findByIdAndUpdate(
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
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        // console.log(campground)
        req.flash("success", "Successfully deleted a campground.");
        res.redirect("/campgrounds");
    })
);

module.exports = router;
