const express = require('express');
const { signUp, login } = require('../controllers/authController');
const { protect, restrictTo } = require('../middlewares/authMiddlewares');
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require('./../controllers/userController');

const router = express.Router();

router.route('/signup').post(signUp);
router.route('/login').post(login);

router.use(protect);
router.use(restrictTo('ADMIN'));

router.route('/').get(getAllUsers);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
