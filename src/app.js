const express = require('express');
const cors = require('cors');
const { logger, morganMiddleware } = require('./utils/logger');
const routes = require('./routes');
const config = require('../config.json');

const app = express();

app.use(cors({
  origin: [
    'http://localhost:8081',
    'http://192.168.8.143:8081'
  ],
  credentials: true
}));
app.use(express.json());
app.use(morganMiddleware);

app.use('/api', routes);

module.exports = { app };
