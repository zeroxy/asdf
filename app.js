
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
  group : [String],
  coupon : [String]
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
  if(!req.session.userid)
    return false;
  memberModel.findOne({"id":req.session.userid}, function(err,docs){
    if(!err && docs!=null){
      if(docs.group.indexOf("admin")!==-1)
        return true;
      else
        return false;
    } else {
      return false;
    }
  });
}
var is_speaker = function (req){
  if(!req.session.userid)
    return false;
  memberModel.findOne({"id":req.session.userid}, function(err,docs){
    if(!err && docs!=null){
      if(docs.group.indexOf("speaker")!==-1)
        return true;
      else
        return false;
    } else {
      return false;
    }
  });
  
}
var is_attendee = function (req){
  if(!req.session.userid)
    return false;
  memberModel.findOne({"id":req.session.userid}, function(err,docs){
    if(!err && docs!=null){
      if(docs.group.indexOf("attendee")!==-1)
        return true;
      else
        return false;
    } else {
      return false;
    }
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
      res.redirect('/');
    } else {
      res.redirect('/prejoin');
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
  memberModel.findOne({id:req.param('userid')}, function(err, docs){
    
  }
  res.render("coupon");
});
app.post('/coupon', function (req, res){
  if(!req,session.userid)
    res.redirect('/');
  console.log(req.session.userid+" -> "+req.param('userid')+"쿠폰을 준다!!");
  if(is_admin(req) || is_speaker(req)){
    if(req.session.userid == req.param('userid')){
      console.log("아이고 부끄러워라!! 본인한테 쿠폰주면 반칙 : "+req.param('userid'));
    } else {
      memberModel.findOne({id:req.param('userid')}, function(err, docs){
        if(docs.coupon.indexOf(req.session.userid) == -1)
          docs.coupon.push(req.session.userid);
        memberModel.update(
          {id:req.param('userid')},
          {$set: {coupon:docs.coupon}}, 
          function (err){
            console.log(err);
            res.redirect('/coupon');
          }
        );
      })
    }
  } else {
    console.log(req.session.userid+"님께서 줄수도 없는 쿠폰가지고 장난질 치면 주금");
  }
});

app.get('/checkdb', function(req, res){
  if (!is_admin(req)){
    memberModel.find({}, function(err, docs){
      console.log(docs);
      res.render('checkdb',{members:docs});
    });
  } else {
    console.log("건방진!! 관리자도 아니면서 관리자 페이지에 접속하다니!!");
    res.redirect('/');
  }
});
app.get('/giveAuth/admin/:userid', function (req, res) {
  console.log(req.param('userid')+"=========\n\n=========");
  memberModel.findOne({id:req.param('userid')}, function(err, docs){
    if(docs.group.indexOf('admin')== -1){
      docs.group.push('admin');
      memberModel.update(
          {id:req.param('userid')},
          {$set: {group:docs.group}}, 
          function (err){
            console.log(err);
            res.redirect('/checkdb');
          }
      );
    }
  });
  res.redirect('/checkdb');
});
app.get('/giveAuth/speaker/:userid', function (req, res) {
  memberModel.findOne({id:req.param('userid')}, function(err, docs){
    if(docs.group.indexOf('speaker')== -1){
      docs.group.push('speaker');
      memberModel.update(
          {id:req.param('userid')},
          {$set: {group:docs.group}}, 
          function (err){
            console.log(err);
            res.redirect('/checkdb');
          }
      );
    }
  });
});
app.get('/popAuth/admin/:userid', function (req, res) {
  console.log(req.param('userid')+"=========\n\n=========");
  memberModel.findOne({id:req.param('userid')}, function(err, docs){
    docs.group.splice(docs.group.indexOf('admin'),1);
    memberModel.update(
        {id:req.param('userid')},
        {$set: {group:docs.group}}, 
        function (err){
          console.log(err);
          res.redirect('/checkdb');
        }
    );
  });
  res.redirect('/checkdb');
});
app.get('/popAuth/speaker/:userid', function (req, res) {
  memberModel.findOne({id:req.param('userid')}, function(err, docs){
    docs.group.splice(docs.group.indexOf('speaker'),1);
    memberModel.update(
        {id:req.param('userid')},
        {$set: {group:docs.group}}, 
        function (err){
          console.log(err);
          res.redirect('/checkdb');
        }
    );
  });
  
});

app.get('/popAuth/attendee/:userid', function (req, res) {
  res.redirect('/checkdb');
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
