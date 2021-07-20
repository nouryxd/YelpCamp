const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

// Schemas
const { campgroundSchema } = require("./schemas.js");

// Helpers
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

// Models
const Campground = require("./models/campground");
const Review = require("./models/review");

const validateCampground = (req, res, next) => {
    const { error } = campgroundSchema.validate(req.body);
    if (error) {
        const msg = error.details.map((el) => el.message).join(",");
        throw new ExpressError(msg, 400);
    }
    next();
    // console.log(result)
};

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection refused:"));
db.once("open", () => {
    console.log("Connected to database");
});

const app = express();

// Adds partial template functions for ejs
app.engine("ejs", ejsMate);

// So that we can use ejs
app.set("view engine", "ejs");

// So that the basepath is always the file with
// app.js in it, regardless of where we call it
app.set("views", path.join(__dirname, "views"));

// Enables us to read the request body from the
// POST request
app.use(express.urlencoded({ extended: true }));

// Enables us to use more than GET and POST in
// a html request.
app.use(methodOverride("_method"));

app.get("/", (req, res) => {
    res.render("home");
});

app.get(
    "/campgrounds",
    catchAsync(async (req, res) => {
        const campgrounds = await Campground.find({});
        res.render("campgrounds/index", { campgrounds });
    })
);

app.get("/campgrounds/new", (req, res) => {
    res.render("campgrounds/new");
});

app.get(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render("campgrounds/show", { campground });
    })
);

app.post(
    "/campgrounds",
    validateCampground,
    catchAsync(async (req, res, next) => {
        // if (!req.body.campground) {
        //     throw new ExpressError('Invalid Campground Data', 400)
        // }
        const campground = new Campground(req.body.campground);
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.get(
    "/campgrounds/:id/edit",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findById(id);
        res.render("campgrounds/edit", { campground });
    })
);

app.put(
    "/campgrounds/:id",
    validateCampground,
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndUpdate(
            id,
            { ...req.body.campground },
            { useFindAndModify: false }
        );
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

app.delete(
    "/campgrounds/:id",
    catchAsync(async (req, res) => {
        const { id } = req.params;
        const campground = await Campground.findByIdAndDelete(id);
        // console.log(campground)
        res.redirect("/campgrounds");
    })
);

app.post(
    "/campgrounds/:id/reviews",
    catchAsync(async (req, res) => {
        const campground = await Campground.findById(req.params.id);
        const review = new Review(req.body.review);
        campground.reviews.push(review);
        await review.save();
        await campground.save();
        res.redirect(`/campgrounds/${campground._id}`);
    })
);

// If no other specified url was hit this
// will catch every path and send a 404 message
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Really basic error handler that we will hit at
// the moment only from app.get new post
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh no, something went wrong :(";
    res.status(statusCode).render("error", { err });
});

app.listen(8080, () => {
    console.log("Listening on port 8080");
});
