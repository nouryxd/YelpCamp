const Campground = require("../models/campground");

// Index
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

// New
module.exports.new = (req, res) => {
    res.render("campgrounds/new");
};
