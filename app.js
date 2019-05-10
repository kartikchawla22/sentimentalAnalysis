// Get the packages we need
var express = require('express');
var cors = require('cors');

// Create Express application
var app = module.exports = express();
app.use(cors());

var NODE_ENV = 'development';
//Set Variables
app.set('env', process.env.NODE_ENV || 'production');
// app.use(bodyParser.json({ limit: '200mb' }));
// app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));


var routes = require('./src/routes/v1/routes_v1');
app.use('/api/v1', routes);
// Use environment defined port or 3000
var port = process.env.PORT || 8080;

// Start the server
app.listen(port);
console.log('Server starts on port ' + port);