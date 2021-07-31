const Campground = require("../models/campground");

// Index
// http://localhost:8080/
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

// Create a new campground
// http://localhost:8080/campgrounds/new
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

// View a specific campground
// http://localhost:8080/campgrounds/61035cc80b22ffed75596f00
module.exports.view = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id)
        .populate({
            path: "reviews",
            populate: {
                path: "author",
            },
        })
        .populate("author");
    // console.log(campground);
    if (!campground) {
        req.flash("error", "Campground not found");
        return res.redirect("/campgrounds");
    }
    // console.log(campground);
    res.render("campgrounds/show", { campground });
};
