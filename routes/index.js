var express = require('express');
var router = express.Router();
var inputHolder = [];
/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express',
    specificInputs: [
      inputHolder[0] = "",
      inputHolder[1] = ""
    ]
  });

});

module.exports = router;
