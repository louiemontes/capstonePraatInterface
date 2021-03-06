var mongojs = require("mongojs");
var db = mongojs("localhost:27017/dbm", ["users", "accessCodes", "fileHistory"]);
//var dbAccessCodes = mongojs("localhost:27017/davidBrazilAccessCodes", ["code"]);
var bcrypt = require('bcryptjs');
var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var upload = require('express-fileupload');


var index = require('./routes/index');
var users = require('./routes/users');
var form = require('./routes/form');
var formerrors = require('./routes/formerrors');
var dataDisplay = require('./routes/dataDisplay');
var result = require('./routes/result');
var feature = require('./routes/feature');
var uploadFile = require('./routes/uploadFile');
var makeAccount = require('./routes/makeAccount');
var login = require('./routes/login');
var admin = require('./routes/admin');
var pastAnalyses = require('./routes/pastAnalyses');
var navigator = require('./routes/navigator');

var validator = require('express-validator');

var spawn = require('child_process').spawn;

var app = express();
var urlencodedParser = bodyParser.urlencoded({ extended: false });
const { exec } = require('child_process');

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(validator());

// must declare use for any /etc extensions to local host
app.use(upload());
app.use('/', index);
app.use('/users', users);
app.use('/form', form);
app.use('/dataDisplay', dataDisplay);
app.use('/uploadFile', uploadFile);
app.use('/result', result);
app.use('/feature', feature);
app.use('/makeAccount', makeAccount);
app.use('/login', login);
app.use('/admin', admin);
app.use('/pastAnalyses', pastAnalyses);
app.use('/navigator', navigator);

//app.use('/formerrors', formerrors);


function decipherArrayFromString(someString) {
  // we could just say "Ey, seperate multiple values by commas bruv"
  let rawStringArray = someString.split(",");

  // trim excess spaces users might of put
  let trimmedStringArray = [];
  for(let i = 0; i < rawStringArray.length; i++) {
    trimmedStringArray[i] = rawStringArray[i].trim();
  }

  // convert to floats
  let arrayToFloats =[];
  for (let i = 0; i < trimmedStringArray.length; i++) {
    arrayToFloats[i] = parseFloat(trimmedStringArray[i]);
  }

  // remove NaNs
  let noMoreNaNs = arrayToFloats.filter(item => !isNaN(item));
  refinedArray = noMoreNaNs;

  if (refinedArray.length === 0) {
    return "";
  } else {
    return refinedArray;
  }
}
//app.get('/result', urlencodedParser, function(req, res) {
//  res.setHeader('Content-disposition', 'attachment; filename=features.mat');
//  mimetype = mime.lookup('features.mat');
//  res.setHeader('Content-type', 'mat');
//  res.sendfile('features.mat');
//});



app.post('/uploadFile', urlencodedParser, function(req, res) {
  console.log("upload File")
  console.log(req.body);


  function isEmpty(obj) {
    return Object.keys(obj).length === 0;
  }
  if(req.body.choice === "Upload Another File") {
        res.render("uploadFile", {
          title: "Upload File",
        });
  }
  if(req.files) {
    var file = req.files.filename;

    if(isEmpty(req.files)) {
      res.render('uploadFile', {
        success: "",
        username: req.body.username,
        errors: "You must upload .wav file. Please try again."
      });
    }
    var filename = file.name;
    if (!filename.includes(".wav")) {
      res.render('uploadFile', {
        success: "",
        username: req.body.username,
        errors: "You must upload a .wav file. Please try again."
      });
    } else {
      file.mv("./soundFiles/" + filename, function(err){
        if(err){
          res.render('uploadFile', {
            success: "",
            username: req.body.username,
            errors: err
          });
        } else {
          res.render("feature", {
            fileTitle: filename,
            username: req.body.username
          });
        }
      });
    }
  } else {
    res.render('uploadFile', {
      success: "",
      username: req.body.username,
      errors: "You must upload .wav file. Please try again."
    });
  }
});


app.post('/feature', urlencodedParser, function(req, res) {



  var addFileHistory = function(data,cb){
    data.fileBaseName = data.fileBaseName + ".wav";
    db.fileHistory.insert({
      username:data.username,
      fileBaseName:data.fileBaseName,
      syllableCount: data.syllableCount,
      pauseCount: data.pauseCount,
      speakingTotalDuration: data.speakingTotalDuration,
      speakingRate: data.speakingRate,
      articulationRate: data.articulationRate,
      averageSylableDuration: data.averageSylableDuration,
      time: data.time
    }, function(err){
      cb();
    });
  };



  console.log("feature")
  console.log(req.body);

  //console.log("req.body: " + req.body);

  console.log("req.body.filename: " + req.body.filename);

   let praatStartCommand = "Praat.app/Contents/MacOS/Praat --run ";
   let praatSpecificScript = "node_modules/praat-scripts/praat-script-syllable-nuclei-v2file.praat ";
   let praatScriptDefaults = "-25 2 0.4 0.1 yes ";
   let serverTempStoragePath = "/Users/luismontes/code/accademic/cs476/davidBrazilModelWebInterface/soundFiles ";
   let userSelectedSoundFile = req.body.filename;
   let cleanUpCommand = " ; rm ./soundFiles/" + userSelectedSoundFile + " ; rm ./soundFiles/" + userSelectedSoundFile + ".TextGrid";

  let scriptCommand = praatStartCommand + praatSpecificScript + praatScriptDefaults + serverTempStoragePath + userSelectedSoundFile + cleanUpCommand;
  console.log(scriptCommand);
  exec(scriptCommand,  (error, stdout, stderr) => {
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }


    var structuredResult  = JSON.parse(stdout);

    structuredResult.username = req.body.username
    structuredResult.time = new Date();

    console.log(structuredResult);
    let userOutputHolder = [];
    userOutputHolder[0] = structuredResult.syllableCount;
    userOutputHolder[1] = structuredResult.pauseCount;
    userOutputHolder[2] = structuredResult.totalDuration;
    userOutputHolder[3] = structuredResult.speakingTotalDuration;
    userOutputHolder[4] = structuredResult.speakingRate;
    userOutputHolder[5] = structuredResult.articulationRate;
    userOutputHolder[6] = structuredResult.averageSylableDuration;
    userOutputHolder[7] = structuredResult.fileBaseName + ".wav";
    userOutputHolder[8] = structuredResult.username;

    // adds history of analysis
    addFileHistory(structuredResult, function(){
      console.log("File history saved");
    });


    console.log(stdout.length);
    res.render("result", {
      resultsFromAnalysis: userOutputHolder
    });
  });
});

app.post('/makeAccount', urlencodedParser, function(req,res) {
  // super important... unless you want cross scripting
  // buddy, that's an open text box.
  // * usually my personal go to for starting trouble on someone else's app *
  req.sanitizeBody('firstname').escape();
  req.sanitizeBody('lastname').escape();
  req.sanitizeBody('username').escape();
  req.sanitizeBody('password').escape();
  req.sanitizeBody('code').escape();
  let inputHolder = [
    req.body.firstname,
    req.body.lastname,
    req.body.username,
    req.body.password,
    req.body.code

  ];
  let errorHolder = [];
  // make server check input in order of priority
  req.checkBody("firstname", "Input a first name.").notEmpty();
  req.checkBody("lastname", "Input a last name.").notEmpty();
  req.checkBody("username", "Input a username.").notEmpty();
  req.checkBody("password", "Input a password.").notEmpty();
  req.checkBody("code", "Input a code.").notEmpty();


  var errors = req.validationErrors();
  //console.log(errors);
  let data = {};
  data.username = inputHolder[2];
  data.password = inputHolder[3];
  data.code = inputHolder[4]
  console.log(data.username);
  console.log(data.password);
  console.log(data.code);

  var addUser = function(data,cb){
    //let inputPassword = data.password;
    //let salt = bcrypt.genSaltSync(10);
    //let hash = bcrypt.hashSync(inputPassword, salt);
    //console.log("User generation hash: " + hash);
    //data.password = hash;
    db.users.insert({username:data.username, password:data.password, email: "placeholder@gmail.com"},function(err){
      cb();
    });
  };





  var isAccessCodeValid = function(data, cb) {
    db.accessCodes.find({code: data.code}, function(err, resp){
      if (resp.length > 0) {
        console.log("access code valid");
        cb(true);
      } else {
        cb(false);
        console.log("access code not valid");
      }
    });
  };

  //console.log(addUser);
  var isUsernameTaken = function(data,cb){
      db.users.find({username:data.username},function(err,resp){
          if(resp.length > 0) {
            console.log("user taken");
            cb(true);
          }else {
            console.log("user not found -> can create account");
            cb(false);
          }
      });
  };

  if (errors) {
    console.log(errors[0]);
    for (let i=0; i < errors.length; i++) {
      if (errors[i].param == "firstname"){
        errorHolder[0] = errors[i].msg;
      } else if (errors[i].param == "lastname"){
        errorHolder[1] = errors[i].msg;
      } else if (errors[i].param == "username"){
        errorHolder[2] = errors[i].msg;
      } else if (errors[i].param == "password"){
        errorHolder[3] = errors[i].msg;
      } else if (errors[i].param == "code"){
        errorHolder[4] = errors[i].msg;
      }
    }
    res.render('makeAccount', {
      title: "Make Account",
      specificErrors: errorHolder,
      specificInputs: inputHolder
    });
    return;
  } else {
    isUsernameTaken(data, function(resp) {
      if(!resp) {
        isAccessCodeValid(data, function(validity){
          if(validity) {
            addUser(data, function(){
              errorHolder[0] = "Account created!";
              console.log("user created!");
              res.render('makeAccount', {
                title: "Make Account",
                specificErrors: errorHolder,
                specificInputs: inputHolder
              });
              db.accessCodes.remove({code: data.code});
            })
          } else {
            errorHolder[4] = "Access Code invalid.";
            res.render('makeAccount', {
              title: "Make Account",
              specificErrors: errorHolder,
              specificInputs: inputHolder
            });

          }
        })
      } else {
        console.log('sees username in use');
        errorHolder[2] = "username in use, please try another.";
        res.render('makeAccount', {
          title: "Make Account",
          specificErrors: errorHolder,
          specificInputs: inputHolder
        });
      }
    });
  }
});


app.post('/admin', urlencodedParser, function(req,res) {
  let inputHolder = [];
  inputHolder[0] = req.body.accessCode;
  let errorHolder = [];
  errorHolder[0] = "";
  errorHolder[1] = "";
  let codes = [];
  let indexBegin = 0;
  db.accessCodes.find({}, function(err, resp){
    for (let item in resp) {
      codeNumber = resp[item].code;
      codes[indexBegin] = codeNumber;
      indexBegin++;
    }
    errorHolder[1] = codes;
  });

  var data = {};
  data.accessCode = inputHolder[0];

  var isCodeTaken = function (data, cb) {
    db.accessCodes.find({code:data.accessCode},function(err,resp){
      if(resp.length > 0) {
        console.log("Code in the system!");
        cb(true);
      } else {
        console.log("Code not in in the system!");
        cb(false);
      }
    });
  };

  isCodeTaken(data, function(resp) {
    let inputHolder = [];
    let errorHolder = [];
    let codeNumber;
    let codes = [];
    let indexBegin = 0;
    if(resp) {
      db.accessCodes.find({}, function(err, resp){
        for (let item in resp) {
        //  console.log(resp[item]);
          codeNumber = resp[item].code;
          codes[indexBegin] = codeNumber;
         // console.log(resp[item].code + "");
          indexBegin++;
        }
        errorHolder[0] = "Access Code already waiting to be used.";
        errorHolder[1] = codes;
        res.render("admin", {
          title: "Admin Page",
          specificInputs: inputHolder,
          specificErrors: errorHolder
        });
      });
    } else if ( isNaN(parseInt(data.accessCode)))  {
      db.accessCodes.find({}, function(err, resp){
        for (let item in resp) {
          codeNumber = resp[item].code;
          codes[indexBegin] = codeNumber;
          indexBegin++;
        }
        errorHolder[0] = "Access Code was a string.";
        errorHolder[1] = codes;
        res.render("admin", {
          title: "Admin Page",
          specificInputs: inputHolder,
          specificErrors: errorHolder
        });
      });
    } else {
      // insert and render success
      db.accessCodes.insert({code:data.accessCode},function(err){
        console.log("code added");
      });
      db.accessCodes.find({}, function(err, resp){
        for (let item in resp) {
          codeNumber = resp[item].code;
          codes[indexBegin] = codeNumber;
          indexBegin++;
        }
        errorHolder[0] = "Access Code was added.";
        errorHolder[1] = codes;
        res.render("admin", {
          title: "Admin Page",
          specificErrors: errorHolder,
          specificInputs: inputHolder
        });
      });
    }
  });
});

app.post('/pastAnalyses', urlencodedParser, function(req,res){
  let inputHolder = [];
  let outputHolder = [];
  let errorHolder = [];
  errorHolder[0] = "";
  inputHolder[0] = req.body.username;

  let listOfHistories = [];
  let listIndexer = 0;
  db.fileHistory.find({username: inputHolder[0]}, function(err, resp){
    for (let item in resp) {
      listOfHistories[listIndexer] = new Object();
      listOfHistories[listIndexer].fileBaseName = resp[item].fileBaseName;
      listOfHistories[listIndexer].syllableCount = resp[item].syllableCount;
      listOfHistories[listIndexer].pauseCount = resp[item].pauseCount;
      listOfHistories[listIndexer].speakingTotalDuration = resp[item].speakingTotalDuration;
      listOfHistories[listIndexer].speakingRate = resp[item].speakingRate;
      listOfHistories[listIndexer].articulationRate = resp[item].articulationRate;
      listOfHistories[listIndexer].averageSylableDuration = resp[item].averageSylableDuration;
      listOfHistories[listIndexer].time = (resp[item].time).getTime();
      listIndexer++;
    }
    console.log("First entry " + listOfHistories[0]);
    // sort by value
    listOfHistories.sort(function (a, b) {
      return b.time - a.time;
    });

    for (let i = 0; i < listOfHistories.length; i++) {
      listOfHistories[i].time = new Date(listOfHistories[i].time);
    }
    outputHolder[0] = listOfHistories;
    console.log("What is put into the outputHolder, bruv: " + outputHolder[0]);
    res.render("pastAnalyses", {
      title: "Past Analyes Page",
      specificInputs: inputHolder,
      specificOutputs: outputHolder,
      specificErrors: errorHolder
    });
  });
});

app.post('/login', urlencodedParser, function(req,res){
  let inputHolder = [
    req.body.username,
    req.body.password
  ];
  let errorHolder = [];

  var data = {};
  data.username = req.body.username;
  data.password = req.body.password;
  inputHolder[0] = data.username;
  inputHolder[1] = data.password;



  var isValidPassword = function(data,cb) {
    db.users.find({username:data.username,password:data.password},function(err,resp){
      if(resp.length > 0) {
        console.log("Password in the system!");
        cb(true);
      } else {
        console.log("No password in the system!");
        cb(false);
      }
    });
  };

  isValidPassword(data, function(resp) {
    if (resp) {
      console.log("successful login");
      if(data.username === "admin") {
        let inputHolder = [];
        let errorHolder = [];
        let codeNumber;
        let codes = [];
        let indexBegin = 0;

        db.accessCodes.find({}, function(err, resp){
          for (let item in resp) {
          //  console.log(resp[item]);
            codeNumber = resp[item].code;
            codes[indexBegin] = codeNumber;
           // console.log(resp[item].code + "");
            indexBegin++;
          }
          console.log(codes);
          errorHolder[1] = codes;
          res.render("admin", {
            title: "Admin Page",
            specificInputs: inputHolder,
            specificErrors: errorHolder
          });
        });
      } else {
        res.render("uploadFile", {
          title: "Upload File",
          username: req.body.username
        });
      }
    } else {
      console.log("failure login");
      errorHolder[0] = "Invalid username or password";
      errorHolder[1] = "Invalid username or password";
      console.log(inputHolder);
      res.render("login", {
        title: "Login",
        specificErrors: errorHolder,
        specificInputs: inputHolder
      });
    }
  });
});



// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.post('/navigator', urlencodedParser, function(req, res) {
  console.log(req.body);
//  console.log("choice? " + req.body.choice);
});



// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
