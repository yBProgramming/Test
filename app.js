var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var mysql = require('mysql')
const deepstream = require( 'deepstream.io-client-js' );

const ds = deepstream( '127.0.0.1:6020' );
ds.login({}, function(){
  console.log('Deeptream is watching');
})
var information = [{
  name: 'John Doe',
  speed: 22
}];

var connection = mysql.createConnection({
  host     : 'localhost',
  user     : 'root',
  password : '',
  database : 'testdeepstream',
  charset: "utf8"
}, function(err){
  if(err) {
    console.log(err);
  } else {
    console.log('Connected to mysql');
  }
});

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));
app.use(function (req, res, next) {

  // Website you wish to allow to connect
  res.setHeader('Access-Control-Allow-Origin', '*');

  // Request methods you wish to allow
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');

  // Request headers you wish to allow
  res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');

  // Set to true if you need the website to include cookies in the requests sent
  // to the API (e.g. in case you use sessions)
  res.setHeader('Access-Control-Allow-Credentials', true);
  
  res.setHeader('Content-Type', 'application/json');
  // Pass to next layer of middleware
  next();
});
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.post('/insert', function(req, res){
  console.log(req.body)
  var msg = req.body.message;
  connection.query("insert into test1(message,_date,_time) values('"+msg+"',now(),now())", function(error, rows, fields){
    if(error) {
      return res.status(500).json({
        record: 'conversation',
        key: 'chats',
        message: "Yes"
      });
    }
    getData('infomation', function(result){
    });
    return res.status(201).json({
      record: 'conversation',
      key: 'chats',
      message: "Yes",
      body: req.body
    });
  });
  
});
app.get('/info', function(req, res){
  getData('infomation', function(result){
    var resdata = {
      record: result['record'],
      key: result['key'],
      message: result['message']
    }
    res.status(result['code']).json(resdata);
  });
});

function getData(data, getSuccess){
  var conversation = ds.record.getRecord( 'conversation' )
  connection.query("SELECT * FROM test1", function(error, rows, fields){
    if(error) {
      console.log(error);
      return getSuccess({
        code: 500,
        record: 'conversation',
        key: 'chats',
        message: "NO"
      });
    }
    conversation.set("chats", rows);
    return getSuccess({
      code: 200,
      record: 'conversation',
      key: 'chats',
      message: "Yes"
    });
  });
}
// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
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
