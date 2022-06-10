const express = require('express');
const router = express.Router();

const { 
  users_list,
  user_create,
  user_exercise_create,
  user_exercises_list,
 } = require('../controllers/usersController');

router.get('/', users_list);
router.post('/', user_create);
router.post('/:id/exercises', user_exercise_create);
router.get('/:id/exercises', user_exercises_list);

module.exports = router;