const prisma = require('../../utils/prisma');

exports.getAll = async (role, departmentId) => {
  // Super admin sees all; admin_jurusan sees only his own department
  if (role === 'SUPER_ADMIN') {
    return prisma.department.findMany({
      include: {
        _count: {
          select: { labs: true }
        }
      }
    });
  }
  if (role === 'ADMIN_JURUSAN' && departmentId) {
    return prisma.department.findMany({
      where: { id: departmentId },
      include: {
        _count: {
          select: { labs: true }
        }
      }
    });
  }
  // For regular user, maybe return only their department
  return [];
};

exports.getById = async (id, user) => {
  // Check access: super_admin all, admin_jurusan only own department
  const department = await prisma.department.findUnique({ where: { id } });
  if (!department) throw new Error('Department not found');
  if (user.role !== 'SUPER_ADMIN' && user.departmentId !== id) {
    throw new Error('Access denied');
  }
  return department;
};

exports.create = async (data) => {
  return prisma.department.create({ data });
};

exports.update = async (id, data, user) => {
  // Ensure the department belongs to admin_jurusan (if not super_admin)
  if (user.role === 'ADMIN_JURUSAN') {
    if (user.departmentId !== id) throw new Error('Access denied');
  }
  return prisma.department.update({ where: { id }, data });
};

exports.remove = async (id, user) => {
  // Same ownership check
  if (user.role === 'ADMIN_JURUSAN') {
    if (user.departmentId !== id) throw new Error('Access denied');
  }
  return prisma.department.delete({ where: { id } });
};