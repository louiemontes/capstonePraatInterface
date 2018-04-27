var express = require('express');
var router = express.Router();
var inputHolder = [];
var errorHolder= [];
inputHolder[0] = "";
errorHolder[0]="";
/* GET home page. */
router.get('/', function(req, res, next) {
//  res.render('admin', {
//    title: 'Express',
//    specificInputs: [
//      inputHolder[0]
//    ],
//    specificErrors: [
//      errorHolder[0]
//    ]
//  });
  res.send("Login first!");
});

module.exports = router;
