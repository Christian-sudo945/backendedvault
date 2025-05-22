const express = require('express');
const { prisma } = require('../prisma');
const { logger } = require('../utils/logger');
const { ObjectId } = require('mongodb');

const router = express.Router();

router.get('/classes/:adviserId', async (req, res) => {
  try {
    let adviserId = req.params.adviserId;
    if (adviserId && adviserId.length === 24) adviserId = new ObjectId(adviserId);
    const classes = await prisma.class.findMany({
      where: { adviserId: adviserId },
      include: { students: true, subjects: true }
    });
    logger.info(`Classes fetched for adviser ${req.params.adviserId}`);
    res.json(classes);
  } catch (error) {
    logger.error(`Classes fetch error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});
router.post('/classes', async (req, res) => {
  try {
    const { name, gradeLevel, section, students, subjects } = req.body;
    const newClass = await prisma.class.create({
      data: {
        name,
        gradeLevel,
        section,
        students: {
          create: Array.isArray(students) ? students : []
        },
        subjects: {
          create: Array.isArray(subjects) ? subjects : []
        }
      },
      include: {
        students: true,
        subjects: true
      }
    });
    logger.info(`Class created: ${name}`);
    res.status(201).json(newClass);
  } catch (error) {
    logger.error(`Failed to add class: ${error.message}`);
    res.status(500).json({ message: 'Failed to add class', error: error.message });
  }
});

module.exports = router;
