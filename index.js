const express = require('express');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const indexRouter = require('./routes');
const usersRouter = require('./routes/users');

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

app.use('/', indexRouter);
app.use('/api/users', usersRouter);

// error handler
app.use((error, req, res, next) => {
  console.log('Error Handling Middleware called');
  console.log('Path: ', req.path);
  console.error('Error: ', error);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
