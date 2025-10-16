export const PageNotFound = (req, res, next) => {
    res.status(404).render("404.ejs", { user: req.user || null });
};