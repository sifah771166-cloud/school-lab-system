const prisma = require('../../utils/prisma');

// Build filter: super_admin sees all, admin_jurusan sees schedules of his department's labs
const buildFilter = (user) => {
  if (user.role === 'SUPER_ADMIN') return {};
  return { lab: { departmentId: user.departmentId } };
};

exports.getAll = async (user) => {
  return prisma.schedule.findMany({ where: buildFilter(user), include: { lab: true, creator: { select: { id: true, name: true } } } });
};

exports.getById = async (id, user) => {
  const schedule = await prisma.schedule.findUnique({ where: { id }, include: { lab: true } });
  if (!schedule) throw new Error('Schedule not found');
  if (user.role !== 'SUPER_ADMIN' && schedule.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return schedule;
};

exports.create = async (data, user) => {
  // Ensure admin_jurusan can only create schedules for labs of own department
  const lab = await prisma.lab.findUnique({ where: { id: data.labId } });
  if (!lab) throw new Error('Lab not found');
  if (user.role === 'ADMIN_JURUSAN' && lab.departmentId !== user.departmentId) {
    throw new Error('You can only create schedules for labs in your own department');
  }
  return prisma.schedule.create({ 
    data: { ...data, createdBy: user.id }, 
    include: { lab: true, creator: { select: { id: true, name: true } } } 
  });
};

exports.update = async (id, data, user) => {
  const schedule = await prisma.schedule.findUnique({ where: { id }, include: { lab: true } });
  if (!schedule) throw new Error('Schedule not found');
  if (user.role !== 'SUPER_ADMIN' && schedule.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return prisma.schedule.update({ where: { id }, data, include: { lab: true } });
};

exports.remove = async (id, user) => {
  const schedule = await prisma.schedule.findUnique({ where: { id }, include: { lab: true } });
  if (!schedule) throw new Error('Schedule not found');
  if (user.role !== 'SUPER_ADMIN' && schedule.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return prisma.schedule.delete({ where: { id } });
};