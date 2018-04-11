var express = require('express');
var router = express.Router();

/* GET result page. */
router.get('/', function(req, res, next) {
// res.render('uploadFile', { errors: "", success: "" });
//  res.render('uploadFile', { title: "Upload File" });
  res.send("Login first!");
});

module.exports = router;
