var mongoose = require("mongoose");
var Movie = require("./models/movie");
var Comment   = require("./models/comment");
 

//clear databse
function seedDB(){
   Movie.remove({}, function(err){
        if(err){
            console.log(err);
        }
        console.log("removed all movies!");
        Comment.remove({}, function(err) {
        });
    }); 
}
 
module.exports = seedDB;