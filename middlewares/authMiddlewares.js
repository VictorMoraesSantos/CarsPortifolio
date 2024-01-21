const { PrismaClient } = require('@prisma/client');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.protect = catchAsync(async (req, res, next) => {
  let token = req.header('Authorization');
  if (!token) return res.status(401).json({ error: 'Access denied' });

  token = token.replace('Bearer ', '');

  const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, role: true },
  });

  if (!user) return res.status(404).json({ error: 'User not found' });
  req.user = user;

  next();
});

exports.restrictTo = (...roles) => {
  return (req, res, next) => {
    console.log(req.user);
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: 403,
        message: 'You do not have permission to perform this action',
      });
    }
    next();
  };
};
