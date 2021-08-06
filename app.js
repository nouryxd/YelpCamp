if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

// Helpers
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const MongoStore = require("connect-mongo");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const mongoSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

// Routes
const userRoutes = require("./routes/users");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");

// const dbUri = "mongodb://localhost:27017/yelp-camp";
const dbUri = process.env.MONGO_URI || "mongodb://localhost:27017/yelp-camp";

// MongoDB
mongoose.connect(dbUri, {
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

// Sanitize input
app.use(mongoSanitize());

// Session

const secret = process.env.SESSION_SECRET;

const store = new MongoStore({
    mongoUrl: process.env.MONGO_URI,
    secret,
    touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
    console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
    store,
    name: "session",
    secret,
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        // secure: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
    },
};
app.use(session(sessionConfig));

// Flashes messages when something happened
// (review deleted, edited whatever)
app.use(flash());

app.use(helmet());

const scriptSrcUrls = [
    "https://stackpath.bootstrapcdn.com",
    "https://api.tiles.mapbox.com",
    "https://api.mapbox.com",
    "https://kit.fontawesome.com",
    "https://cdnjs.cloudflare.com",
    "https://cdn.jsdelivr.net",
];
const styleSrcUrls = [
    "https://kit-free.fontawesome.com",
    "https://stackpath.bootstrapcdn.com",
    "https://api.mapbox.com",
    "https://api.tiles.mapbox.com",
    "https://fonts.googleapis.com",
    "https://use.fontawesome.com",
];
const connectSrcUrls = [
    "https://api.mapbox.com",
    "https://*.tiles.mapbox.com",
    "https://events.mapbox.com",
];
const fontSrcUrls = [];
app.use(
    helmet.contentSecurityPolicy({
        directives: {
            defaultSrc: [],
            connectSrc: ["'self'", ...connectSrcUrls],
            scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
            styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
            workerSrc: ["'self'", "blob:"],
            childSrc: ["blob:"],
            objectSrc: [],
            imgSrc: [
                "'self'",
                "blob:",
                "data:",
                "https://res.cloudinary.com/dhw5ap8io/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
                "https://images.unsplash.com",
            ],
            fontSrc: ["'self'", ...fontSrcUrls],
        },
    })
);

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    // console.log(req.query);
    // console.log(req.session);
    res.locals.currentUser = req.user;
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    next();
});

// Passport fake route
app.get("/fakeuser", async (req, res) => {
    const user = new User({ email: "colt@gmail.com", username: "colttt" });
    const newUser = await User.register(user, "chicken");
    res.send(newUser);
});

// Routes
app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

// Index page, at the moment only contains a link
// to all campgrounds.
app.get("/", (req, res) => {
    res.render("home");
});

// If no other specified url was hit this
// will catch every path and send a 404 message
app.all("*", (req, res, next) => {
    next(new ExpressError("Page Not Found", 404));
});

// Flashes the error message if there was one
app.use((err, req, res, next) => {
    const { statusCode = 500 } = err;
    if (!err.message) err.message = "Oh No, Something Went Wrong!";
    res.status(statusCode).render("error", { err });
});

const port = process.env.PORT || 8080;
app.listen(port, () => {
    console.log(`Listening on port ${port}`);
});
