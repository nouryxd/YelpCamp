const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const ejsMate = require("ejs-mate");

// Helpers
const ExpressError = require("./utils/ExpressError");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");

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

const sessionConfig = {
  secret: "placeholder",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));

// Flashes messages when something happened
// (review deleted, edited whatever)
app.use(flash());

// Passport
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
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
// app.use((err, req, res, next) => {
//     const { statusCode = 500 } = err;
//     if (!err.message) err.message = "Oh no, something went wrong :(";
//     res.status(statusCode).render("error", { err });
// });

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;

  if (err) {
    req.flash("error", "Campground not found");
    return res.redirect(`/campgrounds`);
  }

  if (!err.message) err.message = "Something went wrong!";
  res.status(statusCode).render("error", { err });
});
app.listen(8080, () => {
  console.log("Listening on port 8080");
});
