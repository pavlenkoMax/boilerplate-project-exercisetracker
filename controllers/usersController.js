const {
  getUsersList,
  userCreate,
  userExperianceCreate,
  userExperianceList,
} = require('../models/users');

const users_list = async (req, res) => {
  try {
    const result = await getUsersList();
    res.json(result).end();
  } catch (err) {
    res.sendStatus(500).send(err);
  }
};

const user_create = async (req, res, next) => {
  const { username } = req.body;
  try {
    const user = await userCreate({ username });
    res.json(user).end();
  } catch (err) {
    res.sendStatus(500).send({ error: 'The username must be unique' });
  }
};

const user_exercise_create = async (req, res) => {
  const { description, duration, date } = req.body;
  const { id } = req.params;
  try {
    const experience = await userExperianceCreate(id, description, duration, date);
    res.json(experience);
  } catch (err) {
    res.sendStatus(500).send(err);
  }
};

const user_exercises_list = async (req, res) => {
  const { id } = req.params;
  const { from, to, limit } = req.body;

  try {
    const result = await userExperianceList(id, from, to, limit);
    res.json(result);
  } catch (err) {
    res.sendStatus(500).send(err);
  }
};

module.exports = {
  users_list,
  user_create,
  user_exercise_create,
  user_exercises_list,
};