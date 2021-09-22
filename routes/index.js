var express  = require("express"),
	router   = express.Router(),
	passport = require("passport"),
	User     = require("../models/user");

router.get("/", function(req,res){
	res.render("landing");
});

//Authentication routes
//show register form
router.get("/register", function(req, res){
   res.render("register"); 
});
//handle sign up logic
router.post("/register", function(req, res){
	var newUser = new User({username: req.body.username});
   User.register(newUser, req.body.password, function(err, user){
	   if(err){
		   console.log(err);
		   return res.render("register",{error:err.message});
	   }
	   passport.authenticate("local")(req, res, function(){
	   req.flash("success", "Welcome to Movie App" + user.username);
	   res.redirect("/movies");
	   });
   });
});
//show login form
router.get("/login", function(req, res){
   res.render("login"); 
});
//handle login logic
router.post("/login", passport.authenticate("local", 
    {
        successRedirect: "/movies",
        failureRedirect: "/login"
    }), function(req, res){
});


//Logout routes
router.get("/logout", function(req, res){
   req.logout();
   req.flash("success", "Logged you out");
   res.redirect("/movies");
});


module.exports = router;
