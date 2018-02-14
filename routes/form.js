var express = require('express');
var router = express.Router();

/* GET form page. */
let errorHolder = [];
let inputHolder = [];

router.get('/', function(req, res, next) {
//  res.render('form', { title: 'Form' });
     res.render('form', {
       title: "Form",
       specificErrors: [
         errorHolder[0] = "",
         errorHolder[1] = "",
         errorHolder[2] = "",
         errorHolder[3] = "",
         errorHolder[4] = "",
         errorHolder[5] = "",
         errorHolder[6] = "",
         errorHolder[7] = "",
         errorHolder[8] = "",
         errorHolder[9] = "",
         errorHolder[10] = "",
         errorHolder[11] = "",
         errorHolder[12] = "",
         errorHolder[13] = ""

       ],
       specificInputs: [
         inputHolder[0] = "",
         inputHolder[1] = "",
         inputHolder[2] = "",
         inputHolder[3] = "",
         inputHolder[4] = "",
         inputHolder[5] = "25, 50, 75",
         inputHolder[6] = "12.5",
         inputHolder[7] = "51",
         inputHolder[8] = "0",
         inputHolder[9] = "5",
         inputHolder[10] = "1000000",
         inputHolder[11] = "4",
         inputHolder[12] = "12",
         inputHolder[13] = "10"

       ]
     });


});

module.exports = router;
