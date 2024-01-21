const { carValidator } = require('../utils/validators');
const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../utils/catchAsync');

const prisma = new PrismaClient();

const getSortOrder = (sortParam) => {
  const direction = sortParam.startsWith('-') ? 'desc' : 'asc';
  const field = sortParam.startsWith('-') ? sortParam.substring(1) : sortParam;
  return { [field]: direction };
};

exports.getAllCars = catchAsync(async (req, res, next) => {
  const orderBy = req.query.sort
    ? req.query.sort.split(',').map(getSortOrder)
    : undefined;

  let skip;
  let carsLength = await prisma.car.count();
  if (req.query.page) {
    if (req.query.page < 1 || req.query.page > Math.ceil(carsLength / 10))
      return res.status(400).json({ error: 'Invalid page' });
    skip = (req.query.page - 1) * 10;
  }

  const cars = await prisma.car.findMany({
    skip,
    take: 10,
    orderBy,
    include: { owner: true },
  });

  res.status(200).json({
    status: 'success',
    results: cars.length,
    data: {
      cars,
    },
  });
});

exports.getCar = catchAsync(async (req, res, next) => {
  const car = await prisma.car.findFirst({
    where: {
      id: req.params.id,
    },
  });
  if (!car)
    return res.status(404).json({ status: 'fail', error: 'Car not found' });
  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

exports.createCar = catchAsync(async (req, res, next) => {
  if (carValidator(req.body) === false)
    return res.status(400).json({
      status: 'fail',
      error: 'Invalid data',
    });

  const { email, chassis, ...dataCar } = req.body;
  const user = await prisma.user.findUnique({
    where: {
      email: email,
    },
    include: {
      cars: true,
    },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const existingCar = await prisma.car.findUnique({
    where: { chassis },
  });
  if (existingCar) {
    return res
      .status(400)
      .json({ error: 'Car with this chassis already exists' });
  }

  const car = await prisma.car.create({
    data: {
      ...dataCar,
      chassis,
      owner: {
        connect: {
          id: user.id,
        },
      },
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

exports.updateCar = catchAsync(async (req, res, next) => {
  if (carValidator(req.body) === false)
    return res.status(400).json({ error: 'Invalid data' });

  const car = await prisma.car.update({
    where: {
      id: req.params.id,
    },
    data: {
      ...req.body,
    },
  });

  res.status(200).json({
    status: 'success',
    data: {
      car,
    },
  });
});

exports.deleteCar = catchAsync(async (req, res, next) => {
  const car = await prisma.car.findFirst({
    where: {
      id: req.params.id,
    },
  });
  if (!car) return res.status(404).json({ error: 'Car not found' });

  await prisma.car.delete({
    where: {
      id: req.params.id,
    },
  });

  res.status(200).json({
    status: 'success',
    data: null,
  });
});
