const express = require('express');
const { prisma } = require('../prisma');
const { logger } = require('../utils/logger');

const router = express.Router();

router.get('/data', async (req, res) => {
  try {
    const userEmail = req.query.email;
    if (!userEmail) {
      return res.status(400).json({ message: 'Email parameter is required' });
    }
    const user = await prisma.user.findUnique({
      where: { email: userEmail },
      include: {
        advisoryClass: {
          include: {
            students: {
              select: {
                id: true,
                lrn: true,
                lastName: true,
                firstName: true
              }
            },
            subjects: true,
            attendance: {
              include: {
                records: {
                  include: { student: true }
                },
                subject: true
              },
              orderBy: { date: 'desc' },
              take: 30
            }
          }
        },
        teaching: {
          include: {
            attendance: {
              include: {
                records: true,
                class: true
              },
              orderBy: { date: 'desc' }
            }
          }
        }
      }
    });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    const studentsCount = await prisma.student.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayAttendance = user.advisoryClass?.attendance.filter(a => {
      const attendanceDate = new Date(a.date);
      attendanceDate.setHours(0, 0, 0, 0);
      return attendanceDate.getTime() === today.getTime();
    });
    const presentCount = todayAttendance?.[0]?.records.filter(r => r.status === 'PRESENT').length || 0;
    const presentRate = studentsCount > 0 ? (presentCount / studentsCount) * 100 : 0;
    const dashboardData = {
      user: {
        id: user.id,
        email: user.email,
        fullName: user.fullName,
        role: user.role,
        status: user.status
      },
      advisoryClass: user.advisoryClass,
      teachingSubjects: user.teaching,
      statistics: {
        totalStudents: studentsCount,
        totalSubjects: user.advisoryClass?.subjects.length || 0,
        totalClasses: user.teaching?.length || 0,
        presentRate: Math.round(presentRate),
        totalAttendance: user.advisoryClass?.attendance.length || 0,
        lastSync: new Date()
      }
    };
    await prisma.systemLog.create({
      data: {
        type: 'DATA_FETCH',
        message: `Dashboard data fetched for user: ${userEmail}`,
        metadata: { userId: user.id }
      }
    });
    logger.info(`Dashboard data fetched for ${userEmail}`);
    res.json(dashboardData);
  } catch (error) {
    await prisma.systemLog.create({
      data: {
        type: 'SYSTEM_ERROR',
        message: `Dashboard data fetch error: ${error.message}`,
        metadata: { error: error.toString() }
      }
    });
    logger.error(`Dashboard data fetch error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/data/sync', async (req, res) => {
  try {
    const { type, data, timestamp } = req.body;
    switch (type) {
      case 'students':
        for (const student of data) {
          await prisma.student.upsert({
            where: { lrn: student.lrn },
            update: student,
            create: student
          });
        }
        break;
      case 'attendance':
        for (const record of data) {
          await prisma.attendance.create({
            data: {
              date: new Date(record.date),
              classId: record.classId,
              records: {
                create: record.students
              }
            }
          });
        }
        break;
    }
    await prisma.systemLog.create({
      data: {
        type: 'SYNC_SUCCESS',
        message: `Data synced: ${type}`,
        metadata: { timestamp, count: data.length }
      }
    });
    logger.info(`Data synced: ${type}`);
    res.json({ success: true });
  } catch (error) {
    await prisma.systemLog.create({
      data: {
        type: 'SYNC_ERROR',
        message: `Sync failed: ${error.message}`,
        metadata: { error: error.toString() }
      }
    });
    logger.error(`Sync failed: ${error.message}`);
    res.status(500).json({ message: 'Sync failed' });
  }
});

module.exports = router;
