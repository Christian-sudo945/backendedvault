const express = require('express');
const { prisma } = require('../prisma');
const { logger } = require('../utils/logger');

const router = express.Router();

router.get('/logs', async (req, res) => {
  try {
    const logs = await prisma.systemLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });
    logger.info('System logs fetched');
    res.json(logs);
  } catch (error) {
    logger.error(`Logs fetch error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch logs' });
  }
});

module.exports = router;
