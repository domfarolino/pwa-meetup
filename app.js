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

app.get(/\/([^.]*$)/, (request, response) => {
  request.requestedPage = request.params[0] || 'index'; // should be something like `` or `path`

  const fileToRender = ('partial' in request.query) ? `partials/${request.requestedPage}` : 'app-shell';

  response.render(path.join(`${fileToRender}.ejs`), {}, function(err, document) {
    const timeout = ('partial' in request.query) ? 1000 : 0;
    setTimeout(_ => {
      response.send(document);
    }, timeout);
  });
});

/**
 * Static asset & error handling
 */
app.use('/static', express.static(path.join(__dirname, 'public')));

const listener = app.listen(8080, function() {
  console.log('Listening on port', listener.address().port);
});

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  let err = new Error('Not Found');
  err.status = 404;
  next(err);
});

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
