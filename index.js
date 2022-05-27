const express = require('express');
const path = require('path');
const logger = require('morgan');
const cors = require('cors');
require('dotenv').config();

const app = express();

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

const db = {};

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.post('/api/users', (req, res) => {
  const user = { 
    username: req.body.username,
    id: new Date().getTime(), 
  };

  db[user.id] = user;
  res.json(user).end();
});

app.get('/api/users', (req, res) => {
  res.json(db).end();
});

app.post('/api/users/:id/exercises', (req, res) => {
  const { description, duration, date } = req.body;
  const { id } = req.params;
  const logItem = { 
    description, 
    duration, 
    date: new Date(date).getTime() || new Date().getTime(), // TODO: fix it, save in UTC number
  };

  if (!db[id]) {
    res.status(404).end(`User id:${id} is not find.`);
    return;
  }

  if (db[id].log) {
    db[id].log.push(logItem);
  } else {
    db[id].log = [logItem];
  }

  res.json({ id, ...logItem }).end();
});

app.get('/api/users/:id/logs', (req, res) => {
  const { id } = req.params;
  const user = db[id];

  if (!user) {
    res.status(404).end(`User (id:${id}) is not find.`);
    return;
  }

  res
    .json({
      id,
      username: user.username,
      count: user.log.length,
      log: user.log,
    })
    .end();
});

// TODO: add from, to and limit parameters to a /api/users/:_id/logs request to retrieve part of the log of any user. 
// from and to are dates in yyyy-mm-dd format. limit is an integer of how many logs to send back.

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
