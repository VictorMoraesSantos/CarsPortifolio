const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../utils/catchAsync');

const prisma = new PrismaClient();

exports.getAllUsers = catchAsync(async (req, res, next) => {
  let orderBy;
  if (req.query.sort) {
    const { sort } = req.query;
    const filter = sort.split(',');

    orderBy = filter.map((item) => {
      let direction = 'asc';
      let field = item;

      if (item.startsWith('-')) {
        direction = 'desc';
        field = item.substring(1);
      }

      return { [field]: direction };
    });
  }

  let skip,
    pageSize = 10;
  if (req.query.page) {
    pageSize = 10;
    const userLength = await prisma.user.count();
    const pageNumber = Number(req.query.page);
    if (
      !pageNumber ||
      pageNumber < 1 ||
      pageNumber > Math.ceil(userLength / pageSize)
    ) {
      return res.status(400).json({ error: 'Invalid page' });
    }
    skip = (pageNumber - 1) * pageSize;
  }

  const users = await prisma.user.findMany({
    skip,
    take: pageSize || 10,
    orderBy,
    include: { cars: true },
  });

  const usersWithCarAggregates = await Promise.all(
    users.map(async (user) => {
      const cars = await prisma.car.findMany({
        where: { ownerId: user.id },
      });

      const carCount = cars.length;
      const priceSum = cars.reduce((sum, car) => sum + car.price, 0);
      const priceAvg = priceSum / carCount;
      const priceMax = Math.max(...cars.map((car) => car.price));
      const priceMin = Math.min(...cars.map((car) => car.price));

      return {
        ...user,
        carAggregates: {
          count: carCount,
          sum: priceSum,
          avg: priceAvg,
          max: priceMax,
          min: priceMin,
        },
      };
    })
  );

  res.status(200).json({
    status: 'success',
    results: usersWithCarAggregates.length,
    data: {
      users: usersWithCarAggregates,
    },
  });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id },
    include: { cars: true },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  res.status(200).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });

  const userUpdated = await prisma.user.update({
    where: { id: user.id },
    data: userUpdated,
  });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await prisma.user.findFirst({
    where: { id: req.params.id },
  });
  if (!user) return res.status(404).json({ error: 'User not found' });
  console.log(user);

  await prisma.car.deleteMany({
    where: { ownerId: user.id },
  });

  const userDeleted = await prisma.user.delete({
    where: { id: user.id },
  });
  console.log(userDeleted);

  res.status(200).json({
    status: 'success',
    data: userDeleted,
  });
});
