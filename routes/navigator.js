var express = require('express');
var router = express.Router();
var inputHolder = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('uploadFile', {
    title: 'Express',
  });

});

module.exports = router;
