var express = require('express');
var path = require('path');
var app = express();
var MongoClient = require('mongodb').MongoClient;
var crypto = require("crypto");

var PORT = 8080;
var DB_NAME = 'fcc-url-shortener';
var DB_COLLECTION_NAME = 'urls'
var DB_URL = 'mongodb://quincy:larson@ds163940.mlab.com:63940/' + DB_NAME;
var DOMAIN = 'https://fcc-url-shortener-allanpooley.c9users.io';


app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');



var db;

MongoClient.connect(DB_URL, (err, database) => {
  if (err) return console.log(err)
  db = database
  app.listen(PORT, function (){
    console.log('Listening on port ' + PORT);
  });
  
});



app.get('/', function(req, res) {
    
  // Render 'About' style home page.
  res.render('index');
  
});


// *** NOTE: Issues with parsing https://, http:// <-- May need regex
app.get('/new/:url', function(req, res) {
  
  // Get the full url passed by the user that needs to be shortened.
  var url = req.params.url;
  
  saveURL(url, function(newDoc) {
    // Responds with JSON
    
    console.log(newDoc);
    
    res.send(newDoc);
    
  });
});

app.get('/:id', function(req, res) {
   
  
  // Get the short url id passed by the user on the tail end of the url.
  var id = req.params.id;
  
  // Read record in database that corresponds to passed id.
  var url = readURL(id);
  
  // Redirect to url saved in database
  res.redirect(url);
  
});

function readURL(id) {
  return { "original_url": "test", "short_url": "test" };
}



// Saves a new URL to the database returning the new extension on this domain (shortened URL)
function saveURL(url, callback) {
  
  getNextSequence('urlid', function(err, seq) {
    if (err) console.error(err);
    
    
    var newUrl = {
      "original_url": url,
      "short_url": DOMAIN + '/' + seq
    };
    
    db.collection(DB_COLLECTION_NAME).insert(newUrl, function(err, result) {
        if (err) console.error(err);
        
        callback(newUrl);
    });
    
  });
}

function getNextSequence(name, callback){
    db.collection("counters").findAndModify(
        { "_id": name },
        [],
        { "$inc": { "seq": 1 }},
        { "new": true, "upsert": true },
        function(err, result) {
          callback( err, result.value.seq );
        }
    );
}

