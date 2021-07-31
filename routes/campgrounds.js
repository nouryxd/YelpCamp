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

// Render the  new campground form
// http://localhost:8080/campgrounds/new
router.get("/new", isLoggedIn, campgrounds.renderNewForm);

// Create a new Campground
router.post("/", isLoggedIn, validateCampground, catchAsync(campgrounds.createCampground));

// View a specific campground
// http://localhost:8080/campgrounds/61035cc80b22ffed75596f00
router.get("/:id", catchAsync(campgrounds.showCampground));

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
