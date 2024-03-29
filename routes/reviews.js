var express = require("express");
var router = express.Router({mergeParams: true});
var Movie = require("../models/movie");
var Review = require("../models/review");
var middleware = require("../middleware");

// INDEX
router.get("/", function (req, res) {
    Movie.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, movie) {
        if (err || !movie) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/index", {movie: movie});
    });
});

//CREATE
router.get("/new", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    Movie.findById(req.params.id, function (err, movie) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/new", {movie: movie});

    });
});

//CREATE
router.post("/", middleware.isLoggedIn, middleware.checkReviewExistence, function (req, res) {
    Movie.findById(req.params.id).populate("reviews").exec(function (err, movie) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        let data = {
            rating: req.body['review[rating]'],
            text: req.body['review[text]']
        };
        Review.create(data, function (err, review) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            review.author.id = req.user._id;
            review.author.username = req.user.username;
            review.movie = movie;
            review.save();
            movie.reviews.push(review);
            movie.rating = calculateAverage(movie.reviews);
            movie.save();
            req.flash("success", "Your review has been successfully added.");
            res.redirect('/movies/' + movie._id);
        });
    });
});

function calculateAverage(reviews) {
    if (reviews.length === 0) {
        return 0;
    }
    var sum = 0;
    reviews.forEach(function (element) {
        sum += element.rating;
    });
    return sum / reviews.length;
}

// Reviews Edit
router.get("/:review_id/edit", middleware.checkReviewOwnership, function (req, res) {
    Review.findById(req.params.review_id, function (err, foundReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("reviews/edit", {movie_id: req.params.id, review: foundReview});
    });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Movie.findById(req.params.id).populate("reviews").exec(function (err, movie) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            movie.rating = calculateAverage(movie.reviews);
            movie.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/movies/' + movie._id);
        });
    });
});

// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Movie.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, movie) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            movie.rating = calculateAverage(movie.reviews);
            movie.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/movies/" + req.params.id);
        });
    });
});

module.exports = router;

