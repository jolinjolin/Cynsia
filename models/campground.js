const mongoose = require('mongoose');


//SCHEMA SETUP
var campgroundSchema = new mongoose.Schema({
   name: String,
   price: String,
   image: String,
   description: String,
   createAt: {type: Date, default: Date.now},
   author: {
      id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: "User"
      },
      username: String
   },
   comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
   ],
   reviews: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Review"
        }
    ],
    rating: {
        type: Number,
        default: 0
    }
});

module.exports = mongoose.model("Campground", campgroundSchema);

// var Campground = mongoose.model("Campground", campgroundSchema);
// Campground.create(
// 	{name : "Salmon Creek", image: "https://images.pexels.com/photos/176381/pexels-photo-176381.jpeg?						auto=compress&cs=tinysrgb&h=350", description: "blablabla"},
// 	function(err, campground){
// 	if(err){
// 		console.log(err)
// 	}
// 	else{
// 		console.log("newly created campground")
// 		console.log(campground);
// 	}	
// });