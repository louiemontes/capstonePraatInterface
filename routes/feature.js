var express = require('express');
var router = express.Router();

/* GET result page. */
router.get('/', function(req, res, next) {
  res.render('feature', { resultsFromAnalysis: "" });
});

module.exports = router;
