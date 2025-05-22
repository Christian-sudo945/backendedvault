const express = require('express');
const { prisma } = require('../prisma');
const { logger } = require('../utils/logger');

const router = express.Router();

router.delete('/students/:id', async (req, res) => {
  try {
    const { id } = req.params;
    await prisma.student.delete({
      where: { id }
    });
    await prisma.systemLog.create({
      data: {
        type: 'STUDENT_DELETED',
        message: `Student deleted: ${id}`,
        metadata: { studentId: id }
      }
    });
    logger.info(`Student deleted: ${id}`);
    res.json({ success: true });
  } catch (error) {
    logger.error(`Student delete error: ${error.message}`);
    res.status(500).json({ message: 'Failed to delete student' });
  }
});

module.exports = router;
