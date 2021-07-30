module.exports.isLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        // store the url theyre requesting
        req.flash("error", "You must be signed in");
        return res.redirect("/login");
    }
    next();
};
