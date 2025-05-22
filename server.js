const { app } = require('./src/app');
const { logger } = require('./src/utils/logger');
const config = require('./config.json');
const port = config.port || 3000;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
app.listen(port, async () => {
  logger.info(`Server iS running on port ${port}`);
  logger.info(`API available at http://localhost:${port}`);
  try {
    await prisma.$connect();
    logger.info('Successfully connected on MongoDB server is running');
  } catch (err) {
    logger.error('Failed to connect to MongoDB');
  }
});
process.on('beforeExit', async () => {
  await prisma.$disconnect();
  logger.info('Prisma disconnected');
});
