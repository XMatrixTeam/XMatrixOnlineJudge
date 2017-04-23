
//基本模块
var express = require('express');
var app = express();
var bodyParser = require('body-parser');
//-------------

// post模块
var urlencodedParser = bodyParser.urlencoded({extended: false})
app.use(express.static('public'));
//-------------

//数据库模块
var pidindex = 0;
var mysql = require('mysql');
var mysql_fs = require('fs');
var mysql_file = 'config/mysql.json';
var mysqlConfig = JSON.parse(mysql_fs.readFileSync(mysql_file));  //加载配置文件
var pool = mysql.createPool({
  host : mysqlConfig.host,
  user : mysqlConfig.user,
  password: mysqlConfig.password,
  database: mysqlConfig.database
});  //创建进程池

pool.getConnection(function(err, conn) {
  if (err) console.log('POOL ==> ' + err);
  var sqlRun = "select dataint from global where name='pid'";

  conn.query(sqlRun, function(err, results) {
    if (err) console.log(err);
    console.log('The pid is: ', results[0].dataint);
    pidindex = results[0].dataint;
    conn.release();
  });
});

//-------------

//状态提示
app.get('/submit', function(req, res) {
  res.send('File mod is running!');
  console.log('file ok!');
});
//-----------------

//获取pid
app.post('/submit/getpid', urlencodedParser, function(req, res) {
  pidindex++;
  response = {pid: pidindex, user: req.body.user};
  console.log(response);
  res.send(response);
});
//-----------------



//提交代码
app.post('/submit', urlencodedParser, function(req, res) {
  response1 = {pid: req.body.pid, code: req.body.code};
  console.log(response1);

  var fs = require('fs');

  console.log(
      'write to file: ' +
      'file/' + response1.pid + '.c');
  fs.writeFile('file/' + response1.pid + '.c', response1.code, function(err) {
    if (err) {
      return console.error(err);
    }
    console.log('success save!');
  });  //写入文件



  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
      var sqlRun =
  "update global set dataint='" + response1.pid + "' where name='pid'";
    conn.query(sqlRun, function(error, results, fields) {
      if (error) throw error;
      console.log('updata pid to' + response1.pid);
      conn.release();
    });
  });  //更新pid状态

  //----------

  // todo
  //调用评测系统



  //----------
  response2 =
      {pid: response1.pid, grade: '100', compiledtest: '40', stardtest: '60'};

  setTimeout(function() {
    res.send(response2);
  }, 1000);
});  //发送成绩回应
//-----------------

//----------------------------------------------------------------------------------------------------------------------------------------

//用户登录模块
app.post('/login', urlencodedParser, function(req, res) {

  pool.getConnection(function(err, conn) {
    if (err) console.log('POOL ==> ' + err);
    var sqlRun =
  "select user_name, user_password, user_detail, user_web from user where user_email='" +
  req.body.user_email + "'";
    conn.query(sqlRun, function(error, results, fields) {
      if (error) throw error;
      console.log(req.body);
      console.log(results);
      if (results != '' &&
          results[0].user_password == req.body.user_password) {  //密码正确
        response = {
          state: 'success',
          name: results[0].user_name,
          detail: results[0].user_detail,
          web: results[0].user_web
        };
        res.send(response);
        console.log(response);
      } else {  //密码错误
        response = {state: 'failed'};
        res.send(response);
        console.log(response);
      }
      conn.release();
    });
  });

});

app.get('/login', function(req, res) {
  res.send('Login mod is running!');
  console.log('login ok!');
});  //状态显示

// INSERT INTO `xmoj`.`user` (`user_id`, `user_name`, `user_password`,
// `user_detail`) VALUES ('10000', 'zhenly', '*********', 'it is zhenly
// account!');


// todo
//注册模块

//-----------------------------------------------------------------------------------------


//监听30002端口
var server = app.listen(30002, function() {
  var host = server.address().address;
  var port = server.address().port;
  console.log('Example app listening at https://%s:%s', host, port);
});
//-----------
