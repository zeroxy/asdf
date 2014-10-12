
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');
var mongoose = require('mongoose');

var app = express();

// all environments
app.set('port', process.env.PORT || 3000);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');
app.use(express.favicon());
app.use(express.logger('dev'));
app.use(express.json());
app.use(express.urlencoded());
app.use(express.methodOverride());
app.use(express.cookieParser('your secret here'));
app.use(express.session());
app.use(app.router);
app.use(express.static(path.join(__dirname, 'public')));

// development only
if ('development' == app.get('env')) {
  app.use(express.errorHandler());
}

mongoose.connect('mongodb://test:test@ds035617.mongolab.com:35617/testworld');
//var db = mongoose.connection;
//db.on('error',console.log("db error!!"));
//db.once('open', console.log('db connected!!!'));

//mongoose.connect('mongodb://localhost/myapp');
var db = mongoose.connection;
db.on('error',function(){console.log("db error!!!")});
db.on('connecting', function() {console.log("db connecting!! waiting!!")});
db.once('open', function(){ console.log('db connected!!!')});

var Schema = mongoose.Schema;
var ObjectId = Schema.ObjectId;

var memberSchema = new Schema({
  id : String,
  pass : String,
  join_date : Date,
  group : [String]
});

var memberModel = mongoose.model('member', memberSchema);

// var member = [
//  {id:"admin1", pass:"1", group:["admin"]}
// ,{id:"admin2", pass:"1", group:["admin"]}
// ,{id:"speaker1", pass:"1", group:["speaker"]}
// ,{id:"speaker2", pass:"1", group:["speaker"]}
// ,{id:"speaker3", pass:"1", group:["speaker"]}
// ,{id:"ate1", pass:"1", group:["attendee"]}
// ,{id:"ate2", pass:"1", group:["attendee"]}
// ,{id:"ate3", pass:"1", group:["attendee"]}
// ,{id:"ate4", pass:"1", group:["attendee"]}
// ,{id:"ate5", pass:"1", group:["attendee"]}
// ,{id:"ate6", pass:"1", group:["attendee"]}
// ];

//app.get('/', routes.index);
//app.get('/users', user.list);
var is_admin = function (req){
  memberModel.findOne({"id":req.session.userid}, function(err,docs){
    if(docs.group.indexOf("admin")!==-1)
      return true;
    else
      return false;
  });
}
var is_speaker = function (req){
  memberModel.findOne({"id":req.session.userid}, function(err,docs){
    if(docs.group.indexOf("speaker")!==-1)
      return true;
    else
      return false;
  });
}
var is_attendee = function (req){
  memberModel.findOne({"id":req.session.userid}, function(err,docs){
    if(docs.group.indexOf("attendee")!==-1)
      return true;
    else
      return false;
  });
}
var login_correct = function (req){
  result = false;
  for (index in member){
    if(member[index].id==req.param('id') && member[index].pass == req.param('pass'))
      result = result || true;
    else
      result = result || false;
  }
  return result;
}


app.get('/prejoin', function (req, res){
  if(!req.session.userid)
    res.render('prejoin');
  else
    res.redirect('/');
});
app.post('/prejoin', function (req, res){
  memberr = new memberModel();
  memberr.id = req.param('id');
  memberr.pass = req.param('pass');
  memberr.group.push('attendee');
  memberr.join_date = new Date(); 
  memberr.save(function (err){
    if(!err){
      console.log('success',memberr);
      res.send('asdfasd');
    } else {
      res.send('fail : ',memberr);
    }
  });
});

app.get('/', function (req, res){
  res.render('login');
});

app.post('/login', function(req, res){
  console.log(req.param('id')," = ", req.param('pass'));
  if(!req.session.userid){
    memberModel.find({"id":req.param('id')}, function (err, docs) {
      if ( docs.length != 1) {
        console.log("request id "+ req.param('id') +" is not exist or too many had!!");
        res.send(' 없거나 여러개가 있는 아이디 입니다!! 뭐가 잘못됐어!! <a href="/"> 여기로 와서 다시 로그인 </a>');
      } else {
        if (docs[0].pass===req.param('pass')){
          req.session.userid = req.param('id');
          res.redirect('/coupon');
        } else {
          console.log("login fail!! wrong password");
          res.redirect('/');
        }
      }
    })
  } else {
    res.redirect('/coupon');
  }
});
app.get('/logout', function (req, res){
  req.session.destroy();
  res.redirect('/');
});

app.get('/coupon', function (req, res) {
  res.send("쿠폰 화면 입니다" );
});


app.get('/checkdb', function(req, res){
  memberModel.find({}, function(err, docs){
    console.log(docs);
    res.send(docs);
  });
});

/*
app.get('/', function (req, res){
  if(!req.session.userid){
    res.render('index');
  } else {
    res.redirect('/chat');
  }
});


// 관리자가 관리하는 페이지들
app.get('/admin/attendee_reg', function (req, res){
  if (is_admin(req)){
    res.render('member_view', {'member':member});
  } else {
    res.redirect('/');
  }
})


// 사용자가 사용하느 ㄴ페이지 들..
app.get('/user/:uid', function (req, res){ // 사용자 조회
  if(req.session.userid){
      res.render('user_view', member);
   } else {
     res.redirect('/');
   }
});
app.post('/user/:uid', function (req, res){
});
app.get('/chat', function (req, res){
  if(req.session.userid){
  } else {
    res.redirect('/');
  }
});
*/

http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
