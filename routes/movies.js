var express = require("express"),
	router  = express.Router(),
	Movie = require("../models/movie"),
	middleware = require("../middleware"),
    Review = require("../models/review");
    
//movie routes
//INDEX
router.get("/", function(req, res){
	Movie.find({}, function(err, allMovies){
       if(err){
           console.log(err);
       } else {
		   res.render("movies/index",{movies:allMovies});
       }
    });
});
//CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
        id: req.user._id,
        username: req.user.username
    }
	var newMovie = {name:name, image:image, description:description, author: author};
	Movie.create(newMovie, function(err, newCreate){
		if (err){
			console.log(err);
		}
		else{
			res.redirect("/movies");
		}
	});
});
//NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
	  res.render("movies/new"); 
});
// SHOW
router.get("/:id", function (req, res) {
    Movie.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundMovie) {
        if (err) {
            console.log(err);
        } else {
            res.render("movies/show", {movie: foundMovie});
        }
    });
});
// EDIT
router.get("/:id/edit", middleware.checkMovieOwnership, function(req, res){
    Movie.findById(req.params.id, function(err, foundMovie){
        res.render("movies/edit", {movie: foundMovie});
    });
});

// UPDATE
router.put("/:id", middleware.checkMovieOwnership, function(req, res){
    Movie.findByIdAndUpdate(req.params.id, req.body.movie, function(err, updatedMovie){
       if(err){
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
            Comment.remove({"_id": {$in: movie.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/movies");
                }
                Review.remove({"_id": {$in: movie.reviews}}, function (err) {
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

