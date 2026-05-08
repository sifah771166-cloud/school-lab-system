const prisma = require('../../utils/prisma');

// Get all kunjungan with optional search
exports.getAll = async (user, search) => {
  const where = {};
  
  // Filter by department for ADMIN_JURUSAN
  if (user.role === 'ADMIN_JURUSAN') {
    where.user = { departmentId: user.departmentId };
  }
  
  // Search filter
  if (search) {
    where.OR = [
      { teacherName: { contains: search, mode: 'insensitive' } },
      { classTeaching: { contains: search, mode: 'insensitive' } },
    ];
  }
  
  return prisma.attendance.findMany({
    where,
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    },
    orderBy: { date: 'desc' }
  });
};

// Create kunjungan
exports.create = async (userId, data) => {
  const { teacherName, classTeaching, startTime, endTime, date } = data;
  
  if (!teacherName || !classTeaching || !startTime || !endTime) {
    throw new Error('Semua field harus diisi');
  }
  
  return prisma.attendance.create({
    data: {
      userId,
      teacherName,
      classTeaching,
      startTime,
      endTime,
      date: date || new Date().toISOString().split('T')[0],
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

// Update kunjungan
exports.update = async (id, user, data) => {
  const kunjungan = await prisma.attendance.findUnique({ where: { id } });
  
  if (!kunjungan) {
    throw new Error('Kunjungan tidak ditemukan');
  }
  
  // User can only edit their own kunjungan
  if (user.role === 'USER' && kunjungan.userId !== user.id) {
    throw new Error('Anda tidak memiliki akses untuk mengedit kunjungan ini');
  }
  
  // Admin jurusan can only edit kunjungan from their department
  if (user.role === 'ADMIN_JURUSAN') {
    const kunjunganUser = await prisma.user.findUnique({ where: { id: kunjungan.userId } });
    if (kunjunganUser.departmentId !== user.departmentId) {
      throw new Error('Anda tidak memiliki akses untuk mengedit kunjungan ini');
    }
  }
  
  const { teacherName, classTeaching, startTime, endTime, date } = data;
  
  return prisma.attendance.update({
    where: { id },
    data: {
      teacherName,
      classTeaching,
      startTime,
      endTime,
      date: date || kunjungan.date,
    },
    include: {
      user: {
        select: { id: true, name: true, email: true }
      }
    }
  });
};

// Delete kunjungan (admin only)
exports.delete = async (id, user) => {
  if (user.role === 'USER') {
    throw new Error('Hanya admin yang dapat menghapus kunjungan');
  }
  
  const kunjungan = await prisma.attendance.findUnique({ where: { id } });
  
  if (!kunjungan) {
    throw new Error('Kunjungan tidak ditemukan');
  }
  
  // Admin jurusan can only delete kunjungan from their department
  if (user.role === 'ADMIN_JURUSAN') {
    const kunjunganUser = await prisma.user.findUnique({ where: { id: kunjungan.userId } });
    if (kunjunganUser.departmentId !== user.departmentId) {
      throw new Error('Anda tidak memiliki akses untuk menghapus kunjungan ini');
    }
  }
  
  await prisma.attendance.delete({ where: { id } });
};