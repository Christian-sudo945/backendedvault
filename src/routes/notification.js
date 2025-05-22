const express = require('express');
const { prisma } = require('../prisma');
const { logger } = require('../utils/logger');

const router = express.Router();

router.post('/notifications', async (req, res) => {
  try {
    const { userId, type, message } = req.body;
    const notification = await prisma.notification.create({
      data: { userId, type, message }
    });
    logger.info(`Notification created for user ${userId}`);
    res.json(notification);
  } catch (error) {
    logger.error(`Notification create error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
