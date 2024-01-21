const { PrismaClient } = require('@prisma/client');
const { emailValidator } = require('../utils/validators');
const catchAsync = require('../utils/catchAsync');
const bcryptjs = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

exports.signUp = catchAsync(async (req, res, next) => {
  const { name, email, password } = req.body;
  if (!emailValidator(email) || !name || !password || password.length < 8)
    return res.status(400).json({ error: 'Invalid data' });

  const password_hash = await bcryptjs.hash(password, 12);

  const user = await prisma.user.create({
    data: { name, email, password_hash },
    select: { name: true, email: true, role: true },
  });

  res.status(201).json({
    status: 'success',
    data: {
      user,
    },
  });
});

exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await prisma.user.findFirst({ where: { email } });
  if (!user) return res.status(401).json({ error: 'Authentication failed' });

  const passwordMatch = await bcryptjs.compare(password, user.password_hash);
  if (!passwordMatch)
    return res.status(401).json({ error: 'Authentication failed' });

  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET_KEY, {
    expiresIn: `${process.env.JWT_EXPIRES_IN}d`,
  });
  res.status(200).json({ status: 'success', message: token, user });
});
