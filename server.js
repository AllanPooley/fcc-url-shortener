var express = require('express');
var path = require('path');
var app = express();

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.get('/', function(req, res) {
    
  // Render 'About' style home page.
  res.render('index');
  
});

app.get('/new/:url', function(req, res) {
  
  // Save url in database.
  
});

app.get('/:id', function(req, res) {
  
  // Redirect to url saved in database
  
  
});

// listen for requests :)
var listener = app.listen(8080, function () {
  console.log('Your app is listening on port ' + listener.address().port);
});