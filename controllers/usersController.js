const {
  getUsersList,
  userCreate,
  userExperianceCreate,
  userExperianceList,
} = require('../models/users');

const users_list = async (req, res) => {
  getUsersList()
    .then((result) => {
      res.json(result).end();
    })
    .catch(() => {
      res.status(500).json({ error: 'Something went wrong try again later' });
    });
};

const user_create = (req, res, next) => {
  const { username } = req.body;

  if (!username) return res.status(400).json({ error: 'The "username" param is require' });

  userCreate({ username })
    .then((user) => {
      res.json(user).end();
    })
    .catch(() => {
      res.status(400).json({ error: 'The "username" param must be unique' });
    });
};

const user_exercise_create = async (req, res) => {
  const { description, duration, date } = req.body;
  const { id } = req.params;

  if (!id) return res.status(400).json({ error: 'The "id" param is require' });

  userExperianceCreate(id, description, duration, date)
    .then((experience) => {
      res.json(experience).end();
    })
    .catch((error) => {
      res.status(500).send({ error: error.message });
    });
};

const user_exercises_list = async (req, res) => {
  const { id } = req.params;
  const { from, to, limit } = req.body;

  if (!id) return res.status(400).json({ error: 'The "id" param is require' });

  userExperianceList(id, from, to, limit)
    .then((result) => {
      res.json(result).end();
    })
    .catch((error) => {
      res.status(500).send({ error: error.message });
    });
};

module.exports = {
  users_list,
  user_create,
  user_exercise_create,
  user_exercises_list,
};