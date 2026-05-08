const prisma = require('../../utils/prisma');

// Build filter: super_admin sees all, admin_jurusan sees labs of his department
const buildFilter = (user) => {
  if (user.role === 'SUPER_ADMIN') return {};
  return { departmentId: user.departmentId };
};

exports.getAll = async (user) => {
  return prisma.lab.findMany({ 
    where: buildFilter(user),
    include: { department: true }
  });
};

exports.getById = async (id, user) => {
  const lab = await prisma.lab.findUnique({ 
    where: { id },
    include: { department: true }
  });
  if (!lab) throw new Error('Lab not found');
  if (user.role !== 'SUPER_ADMIN' && lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return lab;
};

exports.create = async (data, user) => {
  // Ensure admin_jurusan can only create labs for own department
  if (user.role === 'ADMIN_JURUSAN' && data.departmentId !== user.departmentId) {
    throw new Error('You can only create labs in your own department');
  }
  return prisma.lab.create({ 
    data,
    include: { department: true }
  });
};

exports.update = async (id, data, user) => {
  const lab = await prisma.lab.findUnique({ where: { id } });
  if (!lab) throw new Error('Lab not found');
  if (user.role !== 'SUPER_ADMIN' && lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return prisma.lab.update({ 
    where: { id }, 
    data,
    include: { department: true }
  });
};

exports.remove = async (id, user) => {
  const lab = await prisma.lab.findUnique({ where: { id } });
  if (!lab) throw new Error('Lab not found');
  if (user.role !== 'SUPER_ADMIN' && lab.departmentId !== user.departmentId) {
    throw new Error('Access denied');
  }
  return prisma.lab.delete({ where: { id } });
};