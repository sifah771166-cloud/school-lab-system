const prisma = require('../../utils/prisma');

// Build filter: super_admin sees all, admin_jurusan sees items of his department's labs
const buildFilter = (user) => {
  if (user.role === 'SUPER_ADMIN') return {};
  return { lab: { departmentId: user.departmentId } };
};

exports.getAll = async (user) => {
  return prisma.item.findMany({ where: buildFilter(user), include: { lab: true } });
};

exports.getById = async (id, user) => {
  const item = await prisma.item.findUnique({ where: { id }, include: { lab: true } });
  if (!item) throw new Error('Item not found');
  if (user.role !== 'SUPER_ADMIN' && item.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return item;
};

exports.create = async (data, user) => {
  // Ensure admin_jurusan can only create items in labs of own department
  const lab = await prisma.lab.findUnique({ where: { id: data.labId } });
  if (!lab) throw new Error('Lab not found');
  if (user.role === 'ADMIN_JURUSAN' && lab.departmentId !== user.departmentId) {
    throw new Error('You can only create items in labs of your own department');
  }
  return prisma.item.create({ data, include: { lab: true } });
};

exports.update = async (id, data, user) => {
  const item = await prisma.item.findUnique({ where: { id }, include: { lab: true } });
  if (!item) throw new Error('Item not found');
  if (user.role !== 'SUPER_ADMIN' && item.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return prisma.item.update({ where: { id }, data, include: { lab: true } });
};

exports.remove = async (id, user) => {
  const item = await prisma.item.findUnique({ where: { id }, include: { lab: true } });
  if (!item) throw new Error('Item not found');
  if (user.role !== 'SUPER_ADMIN' && item.lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return prisma.item.delete({ where: { id } });
};