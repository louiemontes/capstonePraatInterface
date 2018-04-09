var express = require('express');
var router = express.Router();
var inputHolder = [];
var errorHolder= [];

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', {
    title: 'Express',
    specificInputs: [
      inputHolder[0] = "",
      inputHolder[1] = ""
    ],
    specificErrors: [
      errorHolder[0] = "",
      errorHolder[1] = ""
    ]
  });
});

module.exports = router;
