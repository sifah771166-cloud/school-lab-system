const bcrypt = require('bcryptjs');
const prisma = require('../../utils/prisma');
const { signToken } = require('../../utils/jwt');

const saltRounds = 12;

exports.register = async ({ email, password, name, role, departmentId }) => {
  // Check existing user
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    const err = new Error('Email already registered');
    err.statusCode = 409;
    throw err;
  }

  // If role is ADMIN_JURUSAN, departmentId must be provided
  if (role === 'ADMIN_JURUSAN' && !departmentId) {
    const err = new Error('Department ID is required for admin_jurusan');
    err.statusCode = 400;
    throw err;
  }

  const hashedPassword = await bcrypt.hash(password, saltRounds);

  const user = await prisma.user.create({
    data: {
      email,
      password: hashedPassword,
      name,
      role,
      departmentId: departmentId || null,    // null for USER without department?
    },
    select: { id: true, email: true, name: true, role: true },
  });

  return user;
};

exports.login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) {
    const err = new Error('Invalid email or password');
    err.statusCode = 401;
    throw err;
  }

  const token = signToken({ id: user.id, role: user.role });

  return {
    token,
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    },
  };
};