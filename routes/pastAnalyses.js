var express = require('express');
var router = express.Router();
var inputHolder = [];
var outputHolder = [];
var errorHolder = [];

inputHolder[0] = "";
errorHolder[0] = "";
outputHolder[0] = "";

/* GET result page. */
router.get('/', function(req, res, next) {
  res.send("Login first!");
});

module.exports = router;
