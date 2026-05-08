const { verifyToken } = require('../utils/jwt');
const prisma = require('../utils/prisma');

const protect = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization?.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({ message: 'Not authenticated. Please log in.' });
    }

    const decoded = verifyToken(token);
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: { id: true, email: true, role: true, departmentId: true },
    });

    if (!user) {
      return res.status(401).json({ message: 'The user belonging to this token no longer exists.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token. Please log in again.' });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'You do not have permission to perform this action.',
      });
    }
    next();
  };
};

// Middleware untuk check department scope
// Admin jurusan hanya bisa akses data jurusan mereka sendiri
const checkDepartmentAccess = (resourceType) => {
  return async (req, res, next) => {
    try {
      const user = req.user;

      // Super admin bisa akses semua
      if (user.role === 'SUPER_ADMIN') {
        return next();
      }

      // Admin jurusan harus punya departmentId
      if (user.role === 'ADMIN_JURUSAN' && !user.departmentId) {
        return res.status(403).json({
          message: 'Your account is not assigned to any department.',
        });
      }

      // Check berdasarkan resource type
      if (resourceType === 'lab') {
        const labId = req.params.id || req.body.labId;
        if (labId) {
          const lab = await prisma.lab.findUnique({
            where: { id: parseInt(labId) },
            select: { departmentId: true },
          });

          if (!lab) {
            return res.status(404).json({ message: 'Lab not found.' });
          }

          if (user.role === 'ADMIN_JURUSAN' && lab.departmentId !== user.departmentId) {
            return res.status(403).json({
              message: 'You can only access labs in your department.',
            });
          }
        }
      }

      if (resourceType === 'item') {
        const itemId = req.params.id;
        if (itemId) {
          const item = await prisma.item.findUnique({
            where: { id: parseInt(itemId) },
            include: { lab: { select: { departmentId: true } } },
          });

          if (!item) {
            return res.status(404).json({ message: 'Item not found.' });
          }

          if (user.role === 'ADMIN_JURUSAN' && item.lab.departmentId !== user.departmentId) {
            return res.status(403).json({
              message: 'You can only access items in your department.',
            });
          }
        }
      }

      if (resourceType === 'schedule') {
        const scheduleId = req.params.id;
        if (scheduleId) {
          const schedule = await prisma.schedule.findUnique({
            where: { id: parseInt(scheduleId) },
            include: { lab: { select: { departmentId: true } } },
          });

          if (!schedule) {
            return res.status(404).json({ message: 'Schedule not found.' });
          }

          if (user.role === 'ADMIN_JURUSAN' && schedule.lab.departmentId !== user.departmentId) {
            return res.status(403).json({
              message: 'You can only access schedules in your department.',
            });
          }
        }
      }

      next();
    } catch (error) {
      return res.status(500).json({ message: 'Error checking department access.' });
    }
  };
};

module.exports = { protect, authorize, checkDepartmentAccess };