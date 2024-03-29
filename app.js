const express = require("express"),
	app = express(),
	request = require("request"),
	// bodyParser = require("body-parser"),
	flash = require("connect-flash"),
	passport = require("passport"),
	LocalStrategy = require("passport-local"),
	methodOverride = require("method-override"),
	Movie = require("./models/movie"),
	Comment = require("./models/comment"),
	User = require("./models/user"),
	{seedDB, getHighlights} = require("./seeds"),
	Moment = require("moment"),
	mongoose = require('mongoose'),
	dotenv = require('dotenv');
// puppteer = require('puppeteer'),
// cheerio = require('cheerio');

var commentRoutes = require("./routes/comments"),
	movieRoutes = require("./routes/movies"),
	indexRoutes = require("./routes/index"),
	reviewRoutes = require("./routes/reviews");

dotenv.config({path: './.env'});
mongoose.connect(process.env.DB, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
	userCreateIndex: true,
})
	.then(() => console.log('Connected to DB!'))
	.catch(error => console.log(error.message));

// app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false}));
app.use(express.json());
app.set("view engine", "ejs");
app.use(express.static(__dirname + "/public"));
app.use(methodOverride("_method"));
app.use(flash());
getHighlights();
seedDB();
app.locals.moment = Moment;

//Passport config
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

// async function scrapeData(url, page) {
// 	try {
// 		await page.goto(url, {waitUntil : 'load', timeout : 0});
// 		let html = await page.evaluate(() => {
// 			document.body.innerHTML
// 		});

// 	} catch (err) {
// 		console.log(err);
// 	}
// }

// async function getResults() {
// 	browser = await puppteer.launch({headless : false});
// 	const page = await browser.newPage();
// 	let data = await scrapeData('');
// 	browser.close();
// }

app.use(function (req, res, next) {
	res.locals.currentUser = req.user;
	res.locals.error = req.flash("error");
	res.locals.success = req.flash("success");
	next();
});

app.use(indexRoutes);
app.use("/movies", movieRoutes);
app.use("/movies/:id/comments", commentRoutes);
app.use("/movies/:id/reviews", reviewRoutes);

//============================================
app.listen(process.env.PORT, function () {
	console.log("Server has started");
});
