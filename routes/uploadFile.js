var express = require('express');
var router = express.Router();

/* GET result page. */
router.get('/', function(req, res, next) {
  res.render('uploadFile', { errors: "", success: "" });
});

module.exports = router;
