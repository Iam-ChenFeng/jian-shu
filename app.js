"use strict";

const config = require('./config'),
    http = require('http'),
    path = require('path'),
    express = require('express'),
    hbs = require('hbs'),
    logger = require('morgan'),
    cookieParser = require('cookie-parser'),
    cookieSession = require('cookie-session'),
    bodyParser = require('body-parser'),
    mongoose = require('mongoose');

const port = process.env.PORT || config.port,
    dbURL = config.dbURL;
mongoose.connect(dbURL);
mongoose.Promise = require('bluebird');

let app = express();

app.set('views', config.pagePath);
app.set('view engine', 'html');

app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(cookieSession({
    name: 'jianshu',
    keys: ['chen', 'feng']
}));
app.use(express.static(path.join(config.public)));
app.engine('html', hbs.__express);
hbs.registerPartials(path.join(config.template));

http.createServer(app).listen(port);

require(config.routr)(app);

app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err,
            layout : false
        });
    });
}

app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {},
        layout : false
    });
});