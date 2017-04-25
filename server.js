var express = require('express');
var app = express();
var path = require('path');
var MongoClient = require('mongodb').MongoClient;
var validUrl = require('valid-url');

var PORT = 8080;
var DB_NAME = 'fcc-url-shortener';
var DB_COLLECTION_NAME = 'urls';
var DB_URL = 'mongodb://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@ds163940.mlab.com:63940/' + DB_NAME;
var DOMAIN = 'https://url-decapitator.glitch.me/';


app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

var db;

// Initialising connection to database and starting server.
MongoClient.connect(DB_URL, function (err, database) {
  if (err) return console.log(err);
  
  db = database;
  app.listen(PORT, function (){
    console.log('Listening on port ' + PORT);
  });
  
});


// Routing for the 'home' of the web service, which is a 
app.get('/', function(req, res) {
  
  res.render('index'); 
  
});



app.get('/new/*', function(req, res) {
  
  // Get the full url passed by the user that needs to be shortened.
  const originalUrl = req.params[0];
  
  console.log("Attempting to save: + " + originalUrl);
  
  // Check if the url given to the service is a valid HTTP or HTTPS URL
  if (validUrl.isWebUri(originalUrl)) {
    
    // URL is valid, attempt to save to database
    saveURL(originalUrl, function(newDoc) {
      
      if (newDoc) {
        // URL was saved to database
        console.log("Save successful:");
        console.log(newDoc);
        res.send({"original_url": newDoc.original_url, "short_url": newDoc.short_url});
      } else {
        // Unable to save URL to database
        console.log("Save unsuccessful");
        res.send({ error: "Errors saving to the database."});
      }
      
    });
    
  } else {
    // URL was determined to be invalid.
    console.log("Save unsuccessful: url invalid");
    res.send({ error: "Could not save invalid URL."});
    
  }
  
  
});

app.get('/:id', function(req, res) {
   
  
  // Get the short url id passed by the user on the tail end of the url.
  var id = parseInt(req.params.id);
  
  // Find the original url that corresponds to the short url.
  readURL(id, function(foundURL) {

    if (foundURL) {
      console.log("Attempting redirection to: " + foundURL);
      // Sending user to URL that corresponds to given short url id.
      res.redirect(301, foundURL);
    } else {
      console.log("Queried short url not found.");
      res.send({ error: "This short url does not exist."});
      
    }
    
  });
  
});

// Retrieves a saved URL when given a corresponding ID (short url).
function readURL(id, callback) {
  
  console.log("Attempting database query against id: " + id);
  
  db.collection(DB_COLLECTION_NAME).findOne({ "short_url_id": id }, function(err, doc) {  
    if (err) {
      console.error(err);
      // Error in reading from database
      callback(null);
    }
    
    if (doc) {
      // Document was retrieved, return the url corresponding to the short id.
      callback(doc.original_url);
    } else {
      // No Document with that id was found in the database
      callback(null);
    }
  });
  
}

// Saves a new URL to the database returning the new extension on this domain (shortened URL)
function saveURL(url, callback) {
  
  // getNextSequence() returns the unique ID or short url we need.
  // So our code to save a URL sits within a callback. This fires only when a
  // unique ID has been determined, which involves finding and incrementing a 
  // value in our database.
  getNextSequence('urlid', function(err, seq) {
    if (err) console.error(err);
    
    // Composing the document to be saved inside of our database.
    var newUrl = {
      "original_url": url,
      "short_url_id": seq,
      "short_url": DOMAIN + '/' + seq
    };
    
    // Attempting to save the new URL and the short url that has been generated for it.
    db.collection(DB_COLLECTION_NAME).insert(newUrl, function(err, result) {
        if (err) {
          console.error(err);
          // Error in writing to database
          callback(null);
        }
        
        // Return successfully written document.
        callback(newUrl);
    });
    
  });
}

// Used to find a primary key stored in a seperate collection, increment it and 
// return it to be used to save a new URL.
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

