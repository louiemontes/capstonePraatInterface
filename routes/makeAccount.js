var express = require('express');
var router = express.Router();

/* GET form page. */
let errorHolder = [];
let inputHolder = [];

router.get('/', function(req, res, next) {
//  res.render('form', { title: 'Form' });
     res.render('makeAccount', {
       title: "Make Account",
       specificErrors: [
         errorHolder[0] = "",
         errorHolder[1] = "",
         errorHolder[2] = "",
         errorHolder[3] = "",
         errorHolder[4] = ""

       ],
       specificInputs: [
         inputHolder[0] = "",
         inputHolder[1] = "",
         inputHolder[2] = "",
         inputHolder[3] = "",
         inputHolder[4] = ""
       ]
     });


});

module.exports = router;
