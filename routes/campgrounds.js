var express = require("express"),
	router  = express.Router(),
	Campground = require("../models/campground"),
	middleware = require("../middleware"),
    Review = require("../models/review");

//==============Campgrounds routes============
//INDEX
router.get("/", function(req, res){
	Campground.find({}, function(err, allCampgrounds){
       if(err){
           console.log(err);
       } else {
//            request('https://maps.googleapis.com/maps/api/geocode/json?address=sardine%20lake%20ca&key=AIzaSyBtHyZ049G_pjzIXDKsJJB5zMohfN67llM', function (error, response, body) {
//             if (!error && response.statusCode == 200) {
//                 console.log(body); // Show the HTML for the Modulus homepage.
//                 res.render("campgrounds/index",{campgrounds:allCampgrounds});
		   res.render("campgrounds/index",{campgrounds:allCampgrounds});

//             }
// });
       }
    });
});
//CREATE
router.post("/", middleware.isLoggedIn, function(req,res){
	// res.send("You have reached the post route");
	var name = req.body.name;
	var price = req.body.price;
	var image = req.body.image;
	var description = req.body.description;
	var author = {
        id: req.user._id,
        username: req.user.username
    }
	var newCampground = {name:name, price:price, image:image, description:description, author: author};
	// campgrounds.push(newCampground);
	Campground.create(newCampground, function(err, newCreate){
		if (err){
			console.log(err);
		}
		else{
			res.redirect("/campgrounds");
		}
	});
});
//NEW
router.get("/new", middleware.isLoggedIn, function(req,res){
	  res.render("campgrounds/new"); 
});
// SHOW
router.get("/:id", function (req, res) {
    //find the campground with provided ID
    Campground.findById(req.params.id).populate("comments").populate({
        path: "reviews",
        options: {sort: {createdAt: -1}}
    }).exec(function (err, foundCampground) {
        if (err) {
            console.log(err);
        } else {
            //render show template with that campground
            res.render("campgrounds/show", {campground: foundCampground});
        }
    });
});
// EDIT
router.get("/:id/edit", middleware.checkCampgroundOwnership, function(req, res){
	// console.log(currentUser._id);
    Campground.findById(req.params.id, function(err, foundCampground){
        res.render("campgrounds/edit", {campground: foundCampground});
    });
});

// UPDATE
router.put("/:id", middleware.checkCampgroundOwnership, function(req, res){
    // find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
       if(err){
           res.redirect("/campgrounds");
       } else {
           //redirect somewhere(show page)
           res.redirect("/campgrounds/" + req.params.id);
       }
    });
});

// DESTROY
router.delete("/:id", middleware.checkCampgroundOwnership, function (req, res) {
    Campground.findById(req.params.id, function (err, campground) {
        if (err) {
            res.redirect("/campgrounds");
        } else {
            // deletes all comments associated with the campground
            Comment.remove({"_id": {$in: campground.comments}}, function (err) {
                if (err) {
                    console.log(err);
                    return res.redirect("/campgrounds");
                }
                // deletes all reviews associated with the campground
                Review.remove({"_id": {$in: campground.reviews}}, function (err) {
                    if (err) {
                        console.log(err);
                        return res.redirect("/campgrounds");
                    }
                    //  delete the campground
                    campground.remove();
                    req.flash("success", "Campground deleted successfully!");
                    res.redirect("/campgrounds");
                });
            });
        }
    });
});
//==============Campgrounds routes============


module.exports = router;

