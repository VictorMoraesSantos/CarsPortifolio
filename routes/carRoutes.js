const express = require('express');
const {
  getAllCars,
  getCar,
  createCar,
  updateCar,
  deleteCar,
} = require('../controllers/carController');

const router = express.Router();

router.route('/').get(getAllCars).post(createCar);
router.route('/:id').get(getCar).patch(updateCar).delete(deleteCar);

module.exports = router;
