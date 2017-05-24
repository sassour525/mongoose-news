//Dependencies
var express = require('express');
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

// Requiring our Note and Article models
var Note = require("./models/Note.js");
var Article = require("./models/Article.js");

// Our scraping tools
var request = require("request");
var cheerio = require("cheerio");

// Set mongoose to leverage built in JavaScript ES6 Promises
mongoose.Promise = Promise;

// Initialize Express
var app = express();

app.use(bodyParser.urlencoded({
  extended: false
}));

// Make public a static dir
app.use(express.static("public"));

// Use express-handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

// Database configuration with mongoose
mongoose.connect("mongodb://heroku_jqxz2z07:51a2i020qinenhcpk2hem1hicu@ds149481.mlab.com:49481/heroku_jqxz2z07");
var db = mongoose.connection;

// Show any mongoose errors
db.on("error", function(error) {
  console.log("Mongoose Error: ", error);
});

// Once logged in to the db through mongoose, log a success message
db.once("open", function() {
  console.log("Mongoose connection successful.");
});

// Routes

// Load initial page and render scraped articles
app.get('/', function(req, res) {
    Article.find({saved: false}, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.render("index", { articles: result });
        }
    });
});

// Scrape articles and save them to the DB
app.get('/scrape', function(req, res) {
    request("http://www.echojs.com/", function(error, response, html) {
        var $ = cheerio.load(html);
        var promise = null;
        $("article h2").each(function(i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this).children("a").text();
            result.link = $(this).children("a").attr("href");

            var entry = new Article(result);
            // Now, save that entry to the db
            promise = entry.save(function(err, doc) {
                // Log any errors
                if (err) {
                    console.log(err);
                }
            });
        });
        //promise used to wait for scrape to complete
        if (promise instanceof Promise) {
            promise.then(function(result) {
                res.send("Scrape Complete");
            });
        } else {
            res.status(400);
            res.send('Error');
        }
    });
});

// Set saved value in the DB when user clicks save article button
app.post('/saveArticle', function(req, res) {
    console.log(req.body);
    Article.update({'_id': req.body.articleId}, {$set: {'saved': true}}, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.send(result);
        }
    });
});

// Render saved page
app.get('/saved', function(req, res) {
    Article.find({}, function(err, result) {
        if (err) {
            console.log(err);
        } else {
            res.render("saved", { articles: result });
        }
    });
});

//retrieve articles for presenting notes
app.get('/articles/:id', function(req, res) {
    Article.findOne({'_id': req.params.id}).populate('notes').exec(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.send(doc);
        }
    });
});

//update article notes
app.post('/articles/:id', function(req, res) {
    var newNote = new Note(req.body);

    newNote.save(function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            Article.findOneAndUpdate({ '_id': req.params.id }, { $push: { 'notes': doc._id } }, { new: true }).exec(function(err, newdoc) {
                if (err) {
                    console.log(err);
                } else {
                    res.send(newdoc);
                }
            });
        }
    });
});

app.delete('/deleteNote/:id', function(req, res) {
    Note.remove({'_id': req.params.id}, function(err, doc) {
        if (err) {
            console.log(err);
        } else {
            res.send(doc);
        }
    });
});

// Listen on port 3000
app.listen(3000, function() {
  console.log("App running on port 3000!");
});