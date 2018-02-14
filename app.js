var mongojs = require("mongojs");
var db = mongojs("localhost:27017/davidBrazilUsers", ["firstname", "lastname", "username", "password", "email"]);
var data;

var isValidPassword = function(data,cb){
    db.account.find({username:data.username,password:data.password},function(err,res){
        if(res.length > 0)
            cb(true);
        else
            cb(false);
    });
}
var isUsernameTaken = function(data,cb){
    db.account.find({username:data.username},function(err,res){
        if(res.length > 0)
            cb(true);
        else
            cb(false);
    });
}
var addUser = function(data,cb){
    db.account.insert({username:data.username,password:data.password},function(err){
        cb();
    });
}

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

var validator = require('express-validator');

var spawn = require('child_process').spawn

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
  if(req.files) {
    var file = req.files.filename;
    //if (file !== undefined) {
      var filename = file.name;
    //}
    //filename = "" || file.name;
    file.mv("./soundFiles/" + filename, function(err){
      if(err){
        //console.log(err);
        res.render('uploadFile', {
          success: "Error uploading: ",
          errors: err
        });
      } else {
        res.render("uploadFile", {
          success: "File Uploaded!",
          errors: ""
        });
      }
    })
  }
});


app.post('/feature', urlencodedParser, function(req, res) {
  const defaults = {
    encoding: 'utf8',
    timeout: 0,
    maxBuffer: 200 * 1024,
    killSignal: 'SIGTERM',
    cwd: null,
    env: null
  };

  // ../../../Users/luismontes/code/accademic/cs476/scalebarWebService/start.m 
  exec('cd ../../../../../../ ; pwd ; cd Applications/MATLAB_R2017b.app/bin/ ; ./matlab -nodesktop < ../../../Users/luismontes/code/accademic/cs476/davidBrazilModelWebInterface/start.m ', defaults, (error, stdout, stderr) => {
    console.log("test");
    if (error) {
      console.error(`exec error: ${error}`);
      return;
    }
    res.render("result", {
      resultsFromAnalysis: stderr
    });

    //res.send(stdout)
    //stdout = stdout.toString();
    //stdout = stdout.split('<<').pop();
    //console.log(stdout);
    //console.log(`stdout: ${stdout}`);
    //console.log(`stderr: ${stderr}`);
  });
});

app.post('/form', urlencodedParser, function(req,res){
  // super important... unless you want cross scripting
  // buddy, that's an open text box.
  // * usually my personal go to for starting trouble on someone else's app *
  req.sanitizeBody('proj_string').escape();
  req.sanitizeBody('minLat').escape();
  req.sanitizeBody('minLon').escape();
  req.sanitizeBody('maxLat').escape();
  req.sanitizeBody('maxLon').escape();
  req.sanitizeBody('lon_major_ticks').escape();
  req.sanitizeBody('lon_minor_ticks').escape();
  // these others ones still need sanitizing... but less critical since <script> tags
  // cannot even be inserted with the HTML5 number type. still best practice to clean anyways
  // "but doc, I can eat it still from the floor, I dont see any hair or nails on this pork chop!"
  req.sanitizeBody('nnodes').escape();
  req.sanitizeBody('cliplat').escape();
  req.sanitizeBody('lat_tick_interval').escape();
  req.sanitizeBody('mapscale').escape();
  req.sanitizeBody('height').escape();
  req.sanitizeBody('fontsize').escape();
  req.sanitizeBody('paddingsize').escape();


  // make server check input in order of priority
  req.checkBody("proj_string", "Input a projection string.").notEmpty();

  req.checkBody("minLat", "Input a minimum latitude value.").notEmpty();
  req.checkBody("minLon", "Input a minimum longitude value.").notEmpty();
  req.checkBody("maxLat", "Input a maximum latitude value.").notEmpty();
  req.checkBody("maxLon", "Input a maximum longitude value.").notEmpty();

  req.body.lon_major_ticks = decipherArrayFromString(req.body.lon_major_ticks);
  req.body.lon_minor_ticks = decipherArrayFromString(req.body.lon_minor_ticks);
  req.checkBody("lon_major_ticks", "Input Longtitude Major Ticks value(s).").notEmpty();
  req.checkBody("lon_major_ticks", "Input Longtitude Major Ticks value(s).").notEmpty();



  // jay's checks for scalebar
  req.checkBody("lon_major_ticks", "Input Longtitude Major Ticks value(s).").notEmpty();

  req.checkBody("lon_minor_ticks", "Input Longtitude Minor Ticks value(s).").notEmpty();

  req.checkBody("nnodes", "Input a Number of Nodes value.").notEmpty();
  req.checkBody("nnodes", "A Number Of Nodes input value must be an integer.").isInt();

  req.checkBody("cliplat", "Input a Clip Latitude At value.").notEmpty();

  req.checkBody("lat_tick_interval", "Input a Latitude Tick Interval value.").notEmpty();

  req.checkBody("mapscale", "Input a Mapscale denominator value.").notEmpty();
  req.checkBody("mapscale", "A Mapscale value must be an integer.").isInt();

  req.checkBody("height", "Input a value for Height.").notEmpty();

  req.checkBody("fontsize", "Input a value for Font Size.").notEmpty();

  req.checkBody("paddingsize", "Input a value for Padding.").notEmpty();

  let inputHolder = [
    req.body.proj_string,

    req.body.minLat,
    req.body.minLon,
    req.body.maxLat,
    req.body.maxLon,
    req.body.lon_major_ticks,
    req.body.lon_minor_ticks,
    req.body.nnodes,
    req.body.cliplat,

    req.body.lat_tick_interval,

    req.body.mapscale,

    req.body.height,

    req.body.fontsize,

    req.body.paddingsize
  ]

  var errors = req.validationErrors();
  let errorHolder = [];
  for (let i=0; i < 14; i++) {
    errorHolder[i] = "";
  }
  let errorsString = "";


  //
  //console.log(errors);
  if (errors) {

    // new error possibilities for Jay
    let hasproj_stringError = false;
    let hasminLatError = false;
    let hasminLonError = false;
    let hasmaxLatError = false;
    let hasmaxLonError = false;

    let haslon_major_ticksError = false;
    let haslon_minor_ticksError= false;
    let hasnnodesError = false;
    let hascliplatError = false;
    let haslat_tick_intervalError = false;
    let hasmapscaleError = false;
    let hasheightError = false;
    let hasfontsizeError= false;
    let haspaddingsizeError= false;

    // chain errors, and maintain error priority
    for (let i = 0; i< errors.length; i++) {
      if(errors[i].param === "proj_string" && !hasproj_stringError) {
        hasproj_stringsError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[0] = errors[i].msg;


      } else if(errors[i].param === "minLat" && !hasminLatError) {
        haslonminLatError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[1] = errors[i].msg;
      } else if(errors[i].param === "minLon" && !hasminLonError) {
        hasminLonticksError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[2] = errors[i].msg;
      } else if(errors[i].param === "maxLat" && !hasmaxLatError) {
        hasmaxLatError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[3] = errors[i].msg;
      } else if(errors[i].param === "maxLon" && !hasmaxLonError) {
        hasmaxLonError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[4] = errors[i].msg;

      } else if(errors[i].param === "lon_major_ticks" && !haslon_major_ticksError) {
        haslon_major_ticksError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[5] = errors[i].msg;
      } else if(errors[i].param === "lon_minor_ticks" && !haslon_minor_ticksError) {
        haslon_minor_ticksError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[6] = errors[i].msg;

      } else if(errors[i].param === "nnodes" && !hasnnodesError) {
        hasnnodesError= true;
        errorsString += errors[i].msg + "\n";
        errorHolder[7] = errors[i].msg;

      } else if(errors[i].param === "cliplat" && !hascliplatError) {
        hascliplatError= true;
        errorsString += errors[i].msg + "\n";
        errorHolder[8] = errors[i].msg;

      } else if(errors[i].param === "lat_tick_interval" && !haslat_tick_intervalError) {
        haslat_tick_intervalError= true;
        errorsString += errors[i].msg + "\n";
        errorHolder[9] = errors[i].msg;

      } else if(errors[i].param === "mapscale" && !hasmapscaleError) {
        hasmapscaleError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[10] = errors[i].msg;

      } else if(errors[i].param === "height" && !hasheightError) {
        hasheightError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[11] = errors[i].msg;

      } else if(errors[i].param === "fontsize" && !hasfontsizeError) {
        hasfontsizeError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[12] = errors[i].msg;

      } else if(errors[i].param === "paddingsize" && !haspaddingsizeError) {
        haspaddingsizeError = true;
        errorsString += errors[i].msg + "\n";
        errorHolder[13] = errors[i].msg;

      }
    }

    // remove brackets from last lon major/minor tick fields because clearly something has an error
     inputHolder[5] = (req.body.lon_major_ticks).toString();
     inputHolder[6] = (req.body.lon_minor_ticks).toString();


     res.render('form', {
       title: "Form",
       specificErrors: errorHolder,
       specificInputs: inputHolder
     });

     return;
   } else {
     res.render("dataDisplay", {entries: inputHolder});
     return;
   }
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
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
