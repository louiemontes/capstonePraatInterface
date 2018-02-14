var express = require('express');
var router = express.Router();

/* GET formerrors page. */
router.get('/', function(req, res, next) {
  res.render('formerrors', { title: 'Form' });
});

module.exports = router;
