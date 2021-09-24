var express    = require("express"),
	router     = express.Router({mergeParams: true}),
	Movie = require("../models/movie"),
	Comment    = require("../models/comment"),
    middleware = require("../middleware");

//comment routes
//GET
router.get("/new", middleware.isLoggedIn, function(req, res){
	Movie.findById(req.params.id, function(err, movie){
		if(err){
			// console.log(err);
			return
		}
		else{
			res.render("comments/new", {movie:movie});
		}
	});	
});
//CREATE
router.post("/", middleware.isLoggedIn, function(req, res){
	Movie.findById(req.params.id, function(err, movie){
		if(err){
			// console.log(err);
			res.redirect("/movies");
		}
		else{
			let data = {
				text: req.body['comment[text']
			}
			Movie.create(data, function(err, comment){
				if(err){
					// console.log(err);
					redirect("/movies");
				}
				else{
					comment.author.id = req.user._id;
					comment.author.username = req.user.username;
					comment.save();
					movie.comments.push(comment);
					movie.save();
					req.flash("sucess", "Comment created")
					res.redirect("/movies/" + movie._id);
				}
			});
		}
	});
});
//GET
router.get("/:comment_id/edit", middleware.checkCommentOwnership, function(req, res){
   Comment.findById(req.params.comment_id, function(err, foundComment){
      if(err){
          res.redirect("back");
      } else {
        res.render("comments/edit", {movie_id: req.params.id, comment: foundComment});
      }
   });
});

//UPDATE
router.put("/:comment_id", middleware.checkCommentOwnership, function(req, res){
   Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment){
      if(err){
          res.redirect("back");
      } else {
          res.redirect("/movies/" + req.params.id );
      }
   });
});

//DESTROY
router.delete("/:comment_id", middleware.checkCommentOwnership, function(req, res){
    Comment.findByIdAndRemove(req.params.comment_id, function(err){
       if(err){
           res.redirect("back");
       } else {
		   req.flash("sucess", "Comment deleted")
           res.redirect("/movies/" + req.params.id);
       }
    });
});


module.exports = router;