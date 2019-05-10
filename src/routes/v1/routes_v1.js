var express = require('express'); // Making Object Of Express
var router = express.Router(); // Using Routing Function of Express
var apiController = require('../../controllers/controller');
router.route('/createGraph')
  .get(apiController.createGraph)

  // router.route('/testGoogleApi')
  // .get(apiController.testGoogleApi)
module.exports = router; // Exporting router
