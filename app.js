const express = require('express');
const userRouter = require('./routes/userRoutes');
const carRouter = require('./routes/carRoutes');

const app = express();
app.use(express.json());

app.use('/api/v1/users', userRouter);
app.use('/api/v1/cars', carRouter);

module.exports = app;
