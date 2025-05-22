const express = require('express');
const { prisma } = require('../prisma');
const bcrypt = require('bcryptjs');
const { logger } = require('../utils/logger');

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { fullName, email, password, role } = req.body;
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      await prisma.systemLog.create({
        data: {
          type: 'REGISTRATION_FAILED',
          message: `Registration failed - Email already exists: ${email}`,
          metadata: { email }
        }
      });
      logger.warn(`Registration failed for ${email} (exists)`);
      return res.status(400).json({ message: 'Email already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { 
        fullName, 
        email, 
        password: hashedPassword, 
        role: role.toUpperCase(),
        registrationMethod: 'ONLINE',
        status: 'ACTIVE',
        lastLoginAt: new Date()
      }
    });
    await prisma.systemLog.create({
      data: {
        type: 'REGISTRATION_SUCCESS',
        message: `New user registered: ${email}`,
        metadata: { userId: user.id, role: user.role }
      }
    });
    logger.info(`User registered: ${email}`);
    res.json({ 
      message: 'Registration successful',
      user: {
        id: user.id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        status: user.status
      }
    });
  } catch (error) {
    await prisma.systemLog.create({
      data: {
        type: 'SYSTEM_ERROR',
        message: `Registration error: ${error.message}`,
        metadata: { error: error.toString() }
      }
    });
    logger.error(`Registration error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      logger.warn(`Login failed for ${email} (not found)`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      logger.warn(`Login failed for ${email} (invalid password)`);
      return res.status(400).json({ message: 'Invalid credentials' });
    }
    const { password: _, ...userWithoutPassword } = user;
    logger.info(`User logged in: ${email}`);
    res.json({ user: userWithoutPassword });
  } catch (error) {
    logger.error(`Login error: ${error.message}`);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/user/list', async (req, res) => {
  try {
    const users = await prisma.user.findMany({
      select: {
        id: true,
        fullName: true,
        email: true,
        role: true,
        status: true,
        registrationMethod: true,
        lastLoginAt: true,
        createdAt: true,
        updatedAt: true,
        advisoryClass: {
          select: {
            id: true,
            name: true,
            gradeLevel: true,
            section: true
          }
        },
        teaching: {
          select: {
            id: true,
            name: true,
            code: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
    await prisma.systemLog.create({
      data: {
        type: 'USER_LIST_ACCESSED',
        message: 'User list retrieved',
        metadata: { count: users.length }
      }
    });
    //logger.info('User list accessed');
    res.json(users);
  } catch (error) {
    await prisma.systemLog.create({
      data: {
        type: 'SYSTEM_ERROR',
        message: `User list error: ${error.message}`,
        metadata: { error: error.toString() }
      }
    });
    logger.error(`User list error: ${error.message}`);
    res.status(500).json({ message: 'Failed to fetch users' });
  }
});

module.exports = router;
