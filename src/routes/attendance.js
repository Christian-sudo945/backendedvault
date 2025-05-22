const express = require('express');
const { prisma } = require('../prisma');
const { logger } = require('../utils/logger');

const router = express.Router();

router.post('/attendance', async (req, res) => {
  try {
    const { subjectId, classId, date, records } = req.body;
    const attendance = await prisma.attendance.create({
      data: {
        subjectId,
        classId,
        date: new Date(date),
        records: {
          create: records.map(record => ({
            studentId: record.studentId,
            status: record.status,
            remarks: record.remarks
          }))
        }
      },
      include: { records: true }
    });
    logger.info(`Attendance created for class ${classId} on ${date}`);
    res.json(attendance);
  } catch (error) {
    logger.error(`Attendance create error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/attendance/:classId/:from/:to', async (req, res) => {
  try {
    const { classId, from, to } = req.params;
    const attendance = await prisma.attendance.findMany({
      where: {
        classId,
        date: {
          gte: new Date(from),
          lte: new Date(to)
        }
      },
      include: {
        records: {
          include: { student: true }
        },
        subject: true
      },
      orderBy: { date: 'desc' }
    });
    logger.info(`Attendance fetched for class ${classId} from ${from} to ${to}`);
    res.json(attendance);
  } catch (error) {
    logger.error(`Attendance fetch error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
