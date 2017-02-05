'use strict';

const path = require('path');
const crypto = require('crypto');
const logger = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');

const express = require('express');
const app = express();

/**
 * Middleware setup (gross)
 */
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './public'));

/**
 * Custom handler for all cache control
 */
app.get('*', (request, response, next) => {
  response.set({
    'Cache-Control': 'no-cache'
  });

  // Remove bs headers
  response.removeHeader('X-Powered-By');

  // Move on down the line
  next();
});


/**
 * Support for partial view rendering. This handler matches requests like: `/`, `/path`, and `/path/`
 * See regex in action: https://regex101.com/r/ciRbkx/4
 * We render the proper view partial giving it a boolean in the data object related to whether the
 * ?partial query parameter exists in the request. View partials (in ./public) will load in the header
 * and footer partials if the ?partial query parameter does not exist. If the ?partial parameter exists
 * the view partial will not pull in the header and footer, as it is just the main partial content we want
 * and not an entire user-ready page.
 */
app.get(/\/([^.]*$)/, express.static('.'));

/**
 * Static
 */
app.use('/static', express.static(path.join(__dirname, 'public')));

var listener = app.listen(8080, function() {
  console.log('Listening on port', listener.address().port);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, request, response, next) {
    response.status(err.status || 500);
    response.json({
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, request, response, next) {
  response.status(err.status || 500);
  response.json({
    message: err.message,
    error: {}
  });
});

module.exports = app;
