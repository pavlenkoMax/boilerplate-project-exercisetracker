const express = require('express');
const fs = require('fs');
var util = require('util');
const path = require('path');
const sqlite3 = require('sqlite3');
const logger = require('morgan');
const cors = require('cors');
const { nextTick } = require('process');
require('dotenv').config();

const app = express();

// ************************************

let SQL3;
const DB_PATH = path.join(__dirname, 'users.db');
const DB_SQL_PATH = path.join(__dirname, 'users.sql');

async function createDB() {
	const myDB = new sqlite3.Database(DB_PATH);
  
	SQL3 = {
		run(...args) {
			return new Promise(function c(resolve,reject){
				myDB.run(...args,function onResult(err){
					if (err) reject(err);
					else resolve(this);
				});
			});
		},
		get: util.promisify(myDB.get.bind(myDB)),
		all: util.promisify(myDB.all.bind(myDB)),
		exec: util.promisify(myDB.exec.bind(myDB)),
	};

	const initSQL = fs.readFileSync(DB_SQL_PATH, 'utf-8');
	await SQL3.exec(initSQL);
};

createDB().catch(console.error);

// ************************************

app.use(cors());
app.use(express.static('public'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(logger('dev'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '/views/index.html'));
});

app.post('/api/users', async (req, res, next) => {
  const { username } = req.body;

  try {
    const result = await SQL3.run(
      `
      INSERT INTO
        Users
      (username)
      VALUES
        (?)
      `,
      username
    );
  } catch (err) {
    next(err);
  }

  res.end('Ok');
});

app.get('/api/users', async (req, res, next) => {
  try {
    const users = await SQL3.all(
      `
      SELECT 
        * 
      FROM 
        Users
      `
    );
  
    res.json(users).end();
  } catch (err) {
    next(err)
  };
});

app.post('/api/users/:id/exercises', async (req, res, next) => {
  const { description, duration, date } = req.body;
  const { id } = req.params;
;
  try {
    await SQL3.run(
      `
      INSERT INTO
        Exercises
      (userId, description, duration, date)
      VALUES
        (?, ?, ?, ?)
      `,
      id, description, duration, date,
    );
  } catch(err) {
    next(err)
  }

  res.end('Ok');
});

app.get('/api/users/:id/logs/:from?/:to?/:limit?', async (req, res, next) => {
  const { id, from, to, limit } = req.params;

  try {
    const logs = await SQL3.all(
      `
      SELECT 
        Users.id AS 'id',
        Users.username AS 'username',
        Exercises.date AS 'date',
        Exercises.duration AS 'duration',
        Exercises.description AS 'description'
      FROM 
        Exercises
        JOIN Users ON (Exercises.userId = Users.id)
      WHERE
        Users.id = ?
        ${(from && to) ? 'and Exercises.date BETWEEN ? and ?' : ''}
        ${limit ? 'LIMIT ?' : ''} 
      `, id, from, to, limit
    );
  
    res.json(logs).end();
  } catch (err) {
    next(err)
  }
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});
