const db = require('../db');

const getUsersList = async () => {
  const users = await db.all(
    `
    SELECT 
      * 
    FROM 
      Users
    `
  );

  return users;
};

const userCreate = async ({ username } = {}) => {
  const { lastID } = await db.run(
    `
    INSERT INTO
      Users
    (username)
    VALUES
      (?)
    `, username
  );

  return { id: lastID, username };
};

const getUserById = id => {
  return db.get(
    `
    SELECT
      *
    FROM 
      Users
    WHERE
      Users.id = ?
    `, id
  );
};

const getExercisesCount = id => {
  return db.get(
    `
    SELECT 
      COUNT(id)
    FROM
      Exercises
    WHERE 
      Exercises.userId = ?
    `, id
  );
};

const userExperianceCreate = async (id, description, duration, date) => {
  try {
    const user = await getUserById(id);
    const result = await db.run(
      `
      INSERT INTO
        Exercises
      (userId, description, duration, date)
      VALUES
        (?, ?, ?, ?)
      `,
      id, description, duration, date,
    );

    if (result && result.changes > 0) {
      return {
        ...user,
        date,
        duration,
        description,
      };
    } else {
      throw new Error('Something went wrong try again later');
    }
  } catch (err) {
    throw new Error(err);
  }
};

const getExperiancesFromToDate = (id, from, to, limit) => {
  return db.all(
    `
    SELECT
      Exercises.date AS 'date',
      Exercises.duration AS 'duration',
      Exercises.description AS 'description'
    FROM 
      Exercises
      JOIN Users ON (Exercises.userId = Users.id)
    WHERE
      Users.id = ?
      and Exercises.date BETWEEN ? and ?
      ${limit ? 'LIMIT ?' : ''}
    `, id, from, to, limit
  );
};

const getExperiancesFromDate = (id, from, limit) => {
  return db.all(
    `
    SELECT
      Exercises.date AS 'date',
      Exercises.duration AS 'duration',
      Exercises.description AS 'description'
    FROM 
      Exercises
      JOIN Users ON (Exercises.userId = Users.id)
    WHERE
      Users.id = ?
      and Exercises.date >= ?
      ${limit ? 'LIMIT ?' : ''}
    `, id, from, limit
  );
};

const getExperiancesToDate = (id, to, limit) => {
  return db.all(
    `
    SELECT
      Exercises.date AS 'date',
      Exercises.duration AS 'duration',
      Exercises.description AS 'description'
    FROM 
      Exercises
      JOIN Users ON (Exercises.userId = Users.id)
    WHERE
      Users.id = ?
      and Exercises.date < ?
      ${limit ? 'LIMIT ?' : ''}
    `, id, to, limit
  );
};

const getAllExperiances = (id, limit) => {

  return db.all(
    `
    SELECT
      Exercises.date AS 'date',
      Exercises.duration AS 'duration',
      Exercises.description AS 'description'
    FROM 
      Exercises
      JOIN Users ON (Exercises.userId = Users.id)
    WHERE
      Users.id = ?
      ${limit ? 'LIMIT ?' : ''}
    `, id, limit
  );
};

const getAllExperiancesForUser = (id, from, to, limit) => {
  if (from && to) {
    return getExperiancesFromToDate(id, from, to, limit);
  } else if (from && !to) {
    return getExperiancesFromDate(id, from, limit);
  } else if (!from && to) {
    return getExperiancesToDate(id, to, limit);
  } else {
    return getAllExperiances(id, limit);
  }
};

const userExperianceList = async (id, from, to, limit) => {
  try {
    const user = await getUserById(id);
    const exercisesCount = await getExercisesCount(id);
    const exercises = await getAllExperiancesForUser(id, from, to, limit);
    
    if (!user) {
      throw new Error(`User id:${id} is not defined`);
    }

    return {
      ...user,
      count: exercisesCount['COUNT(id)'],
      exercises,
    };
  } catch (err) {
    throw new Error('Something went wrong try again later');
  }
};

module.exports = {
  getUsersList,
  userCreate,
  userExperianceCreate,
  userExperianceList,
};
