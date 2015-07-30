var express = require('express');

var app = express();

app.set('views', 'cloud/views');  // Specify the folder to find templates
app.set('view engine', 'ejs');    // Set the template engine
app.use(express.bodyParser());

app.get('/', function(req, res) {
  res.render('main', {});
});