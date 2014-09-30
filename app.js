
/**
 * Module dependencies.
 */

var express = require('express');
var routes = require('./routes');
var user = require('./routes/user');
var http = require('http');
var path = require('path');

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

var member = [
 {id:"admin1", pass:"1", group:["admin"]}
,{id:"admin2", pass:"1", group:["admin"]}
,{id:"speaker1", pass:"1", group:["speaker"]}
,{id:"speaker2", pass:"1", group:["speaker"]}
,{id:"speaker3", pass:"1", group:["speaker"]}
,{id:"ate1", pass:"1", group:["attendee"]}
,{id:"ate2", pass:"1", group:["attendee"]}
,{id:"ate3", pass:"1", group:["attendee"]}
,{id:"ate4", pass:"1", group:["attendee"]}
,{id:"ate5", pass:"1", group:["attendee"]}
,{id:"ate6", pass:"1", group:["attendee"]}
];

//app.get('/', routes.index);
//app.get('/users', user.list);
var _session_is_ = function (req, power){
  temp = req.session.userid;
  //temp = 'admin1';
  same_id_member =  member.filter(function (value){
    if (value.id == temp)
      return true;
    else
      return false;
  })
  console.log("adsfasdsafd   ",same_id_member.length);
  if(same_id_member.length){
    same_id_same_power = same_id_member[0].group.filter(function (value){
      if(value == power)
        return true;
      else
        return false;
    });
    if (same_id_same_power.length)
      return true;
    else 
      return false;
  } else {
    return false;
  }
  
};
var is_admin = function (req){
  return _session_is_(req, "admin");
}
var is_speaker = function (req){
  return _session_is_(req, "speaker");
}
var is_attendee = function (req){
  return _session_is_(req, "attendee");
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



app.get('/', function (req, res){
  if(!req.session.userid){
    res.render('index');
  } else {
    res.redirect('/chat');
  }
});
app.post('/login', function(req, res){
  console.log(req.param('id')," = ", req.param('pass'));
  if(!req.session.userid){
    if(login_correct(req)){
      req.session.userid = req.id;
      res.redirect('/chat');
    }
  } else {
    res.redirect('/');
  }
});
app.get('/logout', function (req, res){
  req.session.destroy();
  res.redirect('/');
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


http.createServer(app).listen(app.get('port'), function(){
  console.log('Express server listening on port ' + app.get('port'));
});
