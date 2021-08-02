const Campground = require("../models/campground");

// Index
module.exports.index = async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index", { campgrounds });
};

// Render the new campground form
module.exports.renderNewForm = (req, res) => {
    res.render("campgrounds/new");
};

// Create a new campground
module.exports.createCampground = async (req, res, next) => {
    const campground = new Campground(req.body.campground);
    campground.author = req.user._id;
    await campground.save();
    req.flash("success", "Successfully created a new campground");
    res.redirect(`/campgrounds/${campground._id}`);
};

// View a specific campground
module.exports.showCampground = async (req, res) => {
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

// Show campground edit form
module.exports.renderEditForm = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);
    if (!campground) {
        req.flash("error", "Campground not found");
        return res.redirect("/campgrounds");
    }

    res.render("campgrounds/edit", { campground });
};

// Update a campground
module.exports.updateCampground = async (req, res) => {
    const campground = await Campground.findByIdAndUpdate(
        id,
        { ...req.body.campground },
        { useFindAndModify: false }
    );
    req.flash("success", "Successfully updated a campground.");
    res.redirect(`/campgrounds/${campground._id}`);
};

// Delete a campground
module.exports.deleteCampground = async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);
    // console.log(campground)
    req.flash("success", "Successfully deleted a campground.");
    res.redirect("/campgrounds");
};
