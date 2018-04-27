var express = require('express');
var router = express.Router();
var outputHolder = [];
outputHolder[0] = "";
outputHolder[1] = "";
outputHolder[2] = "";
outputHolder[3] = "";
outputHolder[4] = "";
outputHolder[5] = "";
outputHolder[6] = "";
outputHolder[7] = "";


/* GET result page. */
router.get('/', function(req, res, next) {
  res.render('result', {
    title: 'Express',
    resultsFromAnalysis: outputHolder
  });
});

module.exports = router;
