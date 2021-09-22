var Movie = require("../models/movie");
var Comment = require("../models/comment");
// var Review = require("../models/review");

var middlewareObj = {};

middlewareObj.checkMovieOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Movie.findById(req.params.id, function(err, foundMovie){
           if(err){
			   req.flash("error", "Movie not found")
               res.redirect("back");
           }  else {
            if(foundMovie.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission")
                res.redirect("back");
            }
           }
        });
    } else {
		req.flash("error", "You need to log in")
        res.redirect("back");
    }
}

middlewareObj.checkCommentOwnership = function(req, res, next) {
 if(req.isAuthenticated()){
        Comment.findById(req.params.comment_id, function(err, foundComment){
           if(err){
               res.redirect("back");
           }  else {
            if(foundComment.author.id.equals(req.user._id)) {
                next();
            } else {
				req.flash("error", "You don't have permission")
                res.redirect("back");
            }
           }
        });
    } else {
        res.redirect("back");
    }
}

middlewareObj.isLoggedIn = function(req, res, next){
    if(req.isAuthenticated()){
        return next();
    }
	req.flash("error", "You need to log in")
    res.redirect("/login");
}

middlewareObj.checkReviewOwnership = function(req, res, next) {
    if(req.isAuthenticated()){
        Review.findById(req.params.review_id, function(err, foundReview){
            if(err || !foundReview){
                res.redirect("back");
            }  else {
                if(foundReview.author.id.equals(req.user._id)) {
                    next();
                } else {
                    req.flash("error", "You don't have permission to do that");
                    res.redirect("back");
                }
            }
        });
    } else {
        req.flash("error", "You need to be logged in to do that");
        res.redirect("back");
    }
};

middlewareObj.checkReviewExistence = function (req, res, next) {
    if (req.isAuthenticated()) {
        Movie.findById(req.params.id).populate("reviews").exec(function (err, foundMovie) {
            if (err || !foundMovie) {
                req.flash("error", "Movie not found.");
                res.redirect("back");
            } else {
                var foundUserReview = foundMovie.reviews.some(function (review) {
                    return review.author.id.equals(req.user._id);
                });
                if (foundUserReview) {
                    req.flash("error", "You already wrote a review.");
                    return res.redirect("/movies/" + foundMovie._id);
                }
                next();
            }
        });
    } else {
        req.flash("error", "You need to login first.");
        res.redirect("back");
    }
};

module.exports = middlewareObj;