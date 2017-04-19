var express = require('express');
var path = require('path');
var app = express();
var MongoClient = require('mongodb').MongoClient;

var PORT = 8080;
var DB_NAME = 'fcc-url-shortener';
var COLLECTION_NAME = 'urls'
var DB_URL = 'mongodb://quincy:larson@ds163940.mlab.com:63940/' + DB_NAME;
var DOMAIN = 'https://fcc-url-shortener-allanpooley.c9users.io';


app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    
  // Render 'About' style home page.
  res.render('index');
  
});

app.get('/new/:url', function(req, res) {
  
  // Get the full url passed by the user that needs to be shortened.
  var url = req.params.url;
  
  // Save URL in database, getting shortened URL
  var extension = saveURL(url);
  
  // Responds with JSON
  res.send( 
    { "original_url": url, 
      "short_url": DOMAIN + '/' + extension }
  );
  
});

app.get('/:id', function(req, res) {
  
  // Get the short url id passed by the user on the tail end of the url.
  var id = req.params.id;
  
  // Read record in database that corresponds to passed id.
  var url = readURL(id);
  
  // Redirect to url saved in database
  res.redirect(url);
  
});

app.listen(PORT, function (){
  console.log('Listening on port ' + PORT);
});


// Saves a new URL to the database returning the new extension on this domain (shortened URL)
function saveURL(url) {
  return "1";
}

// Retrieves a url saved in the database and returns 
function readURL(id) {
  return "www.google.com.au";
}

function countURLs() {
  return 0;
}

