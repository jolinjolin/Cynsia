var mongoose = require("mongoose");
var Movie = require("./models/movie");
var Highlight = require("./models/highlight");
var Comment = require("./models/comment");
var request = require("request");
var puppteer = require('puppeteer');
var cheerio = require('cheerio');

function callAPI(finishAPI, id) {
    request("https://api.themoviedb.org/3/movie/" + id + "?api_key=54a10a45b22db7c593516ade575f8c41", { json: true }, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        if (res.statusCode === 200) {
            finishAPI(body);
        }
    });
}

async function scrapeData(url, page) {
    try {
        await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });
        let html = await page.content();
        const $ = await cheerio.load(html);
        let data = [];
        for(let i = 1; i <= 6; ++i) {
            let titleStr = "#popular_scroller > div > div:nth-child(" + i + ") > div.content > h2" ;
            let realeaseDateStr = "#popular_scroller > div > div:nth-child(" + i + ") > div.content > p" ;
            let imgStr = "#popular_scroller > div > div:nth-child(" + i + ") >  div.image > div.wrapper > a > img";
        let title = $(titleStr).text();
        let releaseDate = $(realeaseDateStr).text();
        let imgUrl = "https://www.themoviedb.org";
        imgUrl += $(imgStr).attr("src");
        let data = {
            name: title,
            image: imgUrl,
            releaseDate: releaseDate,
        }
        // console.log(data)
        Highlight.create(data, function (err, newCreate) {
            if (err) {
                console.log(err);
            }
            else {
            }
        });
        }

    } catch (err) {
        console.log(err);
    }
}

//clear databse
function seedDB() {
    Movie.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
        console.log("removed all movies!");
        Comment.remove({}, function (err) {
        });
    });
    let id_min = 1, id_max = 800;
    let i = id_min;
    for (; i < id_max; ++i) {
        callAPI((finishAPI) => {
            let imgUrl = "https://www.themoviedb.org/t/p/w300_and_h450_bestv2/";
            imgUrl += finishAPI.poster_path;
            let author = {
                id: "123",
                username: "admin"
            }
            let newMovie = { name: finishAPI.original_title, image: imgUrl, description: finishAPI.overview };
            Movie.create(newMovie, function (err, newCreate) {
                if (err) {
                    console.log(err);
                }
                else {
                    // res.redirect("/movies");
                }
            });
        }, i.toString()
        );
    }
}

async function getHighlights() {
    await Highlight.remove({}, function (err) {
        if (err) {
            console.log(err);
        }
        console.log("removed hightlights")
    });
    const browser = await puppteer.launch({ headless: false });
    const page = await browser.newPage();
    let data = await scrapeData("https://www.themoviedb.org/?language=en-US", page);
    await browser.close();
}


module.exports = {
    seedDB,
    getHighlights
}