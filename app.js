var ejs = require('ejs');
var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var TokenHelper = require('./common/TokenHelper');

var usersRouter = require('./routes/users');
var startRouter = require('./routes/start');
var homeRouter = require('./routes/home');
var mainRouter = require('./routes/main');
var investorRouter = require('./routes/investor');
var investmentRouter = require('./routes/investment');
var paramPouter = require('./routes/param');
var permitconfigRouter = require('./routes/permitconfig');
var permitRouter = require('./routes/permit');
var roleRouter = require('./routes/role');

var app = express();


//允许跨域(适合token方式，跨域无法携带cookie)
app.all('*', function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Credentials", "true");
  res.header("Access-Control-Expose-Headers", "access-token");
  res.header("Access-Control-Allow-Headers", "X-Requested-With,Content-Type,access-token,permit-token");
  res.header("Access-Control-Allow-Methods", "PUT,POST,GET,DELETE,OPTIONS");
  res.header("X-Powered-By", " 3.2.1");
  res.header("Content-Type", "application/json;charset=utf-8");
  if (req.headers["access-token"] && req.method.toLocaleUpperCase() !== "OPTIONS") {
    TokenHelper.get(req.headers["access-token"]).then(user => {
      delete user.iat;
      delete user.exp;
      req["UserInfo"] = user;
      if (user && !(/logout/gi.test(req.url))) {
        res.header("access-token", TokenHelper.set(user));
      }
      TokenHelper.get(req.headers["permit-token"]).then(permit => {
        delete permit.iat;
        delete permit.exp;
        req["UserPermit"] = permit;
        next();
      });
    }).catch(() => {
      next();
    });
  } else {
    next();
  }
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


//路由配置(写成.ashx是历史遗留问题)
app.use("/Http/Msg/MsgStart.ashx", startRouter);
app.use("/Http/Msg/HomeServer.ashx", homeRouter);
app.use("/Http/Msg/MainServer.ashx", mainRouter);
app.use("/Http/Msg/InvestorServer.ashx", investorRouter);
app.use("/Http/Msg/InvestmentServer.ashx", investmentRouter);
app.use("/Http/Msg/ParamServer.ashx", paramPouter);
app.use("/Http/Msg/PermitconfigServer.ashx", permitconfigRouter);
app.use("/Http/Msg/PermitServer.ashx", permitRouter);
app.use("/Http/Msg/RoleServer.ashx", roleRouter)
app.use('/Http/Msg/UserServer.ashx', usersRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
