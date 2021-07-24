const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

// Helpers
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");

// Routes
const campgrounds = require("./routes/campgrounds");
const reviews = require("./routes/reviews");

mongoose.connect("mongodb://localhost:27017/yelp-camp", {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
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

app.use(express.static(path.join(__dirname, "public")));

// Routes
app.use("/campgrounds", campgrounds);
app.use("/campgrounds/:id/reviews", reviews);

app.get("/", (req, res) => {
    res.render("home");
});

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
