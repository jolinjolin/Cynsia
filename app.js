var express       = require("express"),
    app           = express(),
	request       = require("request"),
	bodyParser    = require("body-parser"),
	// mongoose      = require('mongoose'),
	flash         = require("connect-flash"),
	passport      = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride= require("method-override"),
    Campground    = require("./models/campground"),
	Comment       = require("./models/comment"),
	User          = require("./models/user"),
	seedDB        = require("./seeds"),
	Moment		  = require("moment");
const mongoose = require('mongoose');

var commentRoutes = require("./routes/comments"),
	campgroundRoutes = require("./routes/campgrounds"),
	indexRoutes = require("./routes/index"),
	reviewRoutes  = require("./routes/reviews");
	
mongoose.connect('mongodb://localhost:27017/yelp_camp', {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log('Connected to DB!'))
.catch(error => console.log(error.message));

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
//seedDB();
app.locals.moment = Moment;

//=============PASSPORT CONFIGURATION===============
app.use(require("express-session")({
    secret: "Once again Rusty wins cutest dog!",
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
// passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());
//=============PASSPORT CONFIGURATION===============

app.use(function(req, res, next){
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/comments", commentRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

//============================================
app.listen(3000, function(){
	console.log("yelp camp server has started");
});