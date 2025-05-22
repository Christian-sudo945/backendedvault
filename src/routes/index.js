const express = require('express');
const userRoutes = require('./user');
const classRoutes = require('./class');
const attendanceRoutes = require('./attendance');
const notificationRoutes = require('./notification');
const logRoutes = require('./log');
const dataRoutes = require('./data');
const studentRoutes = require('./student');

const router = express.Router();

router.use(userRoutes);
router.use(classRoutes);
router.use(attendanceRoutes);
router.use(notificationRoutes);
router.use(logRoutes);
router.use(dataRoutes);
router.use(studentRoutes);

module.exports = router;
