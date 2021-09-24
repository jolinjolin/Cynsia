var express = require("express"),
    router = express.Router(),
    Movie = require("../models/movie"),
    Highlight = require("../models/highlight"),
    middleware = require("../middleware"),
    Review = require("../models/review"),
    Comment = require("../models/comment");

//movie routes
//INDEX
router.get("/", function (req, res) {
    let highlights;
    Highlight.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            highlights = data;
        }
    });
    Movie.find({}, function (err, allMovies) {
        if (err) {
            console.log(err);
        } else {
            res.render("movies/index", { movies: allMovies, highlights: highlights });
        }
    });

});
//CREATE
router.post("/", middleware.isLoggedIn, function (req, res) {
    var name = req.body.name;
    var image = req.body.image;
    var description = req.body.description;
    var author = {
        id: req.user._id,
        username: req.user.username
    }
    var newMovie = { name: name, image: image, description: description, author: author };
    Movie.create(newMovie, function (err, newCreate) {
        if (err) {
            console.log(err);
        }
        else {
            res.redirect("/movies");
        }
    });
});
//NEW
router.get("/new", middleware.isLoggedIn, async function (req, res) {
    let search = (req.query.search).toString();
    Movie.findOne({ name: search }, function (err, data) {
        if (err || !data) {
            // console.log(err);
            res.send("Not found")
        }
        else {
            res.render("movies/new", { data: data });
        }
    });
});
// SHOW
router.get("/:id", function (req, res) {
    Movie.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: { sort: { createdAt: -1 } }
    }).exec(function (err, foundMovie) {
        if (err) {
            console.log(err);
        } 
        else {
            res.render("movies/show", { movie: foundMovie });
        }
    });
});
// EDIT
router.get("/:id/edit", middleware.checkMovieOwnership, function (req, res) {
    Movie.findById(req.params.id, function (err, foundMovie) {
        res.render("movies/edit", { movie: foundMovie });
    });
});

// UPDATE
router.put("/:id", middleware.checkMovieOwnership, function (req, res) {
    Movie.findByIdAndUpdate(req.params.id, req.body.movie, function (err, updatedMovie) {
        if (err) {
            res.redirect("/movies");
        } else {
            res.redirect("/movies/" + req.params.id);
        }
    });
});

// DESTROY
router.delete("/:id", middleware.checkMovieOwnership, function (req, res) {
    Movie.findById(req.params.id, function (err, movie) {
        if (err) {
            res.redirect("/movies");
        } else {
            Comment.remove({ "_id": { $in: movie.comments } }, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/movies");
                }
                Review.remove({ "_id": { $in: movie.reviews } }, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/movies");
                    }
                    movie.remove();
                    req.flash("success", "Movie deleted!");
                    res.redirect("/movies");
                });
            });
        }
    });
});

module.exports = router;

