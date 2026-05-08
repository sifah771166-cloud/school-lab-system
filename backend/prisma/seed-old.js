const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hash password
  const hashedPassword = await bcrypt.hash('admin123', 12);

  // Create Super Admin
  const superAdmin = await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {},
    create: {
      email: 'admin@school.com',
      password: hashedPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin created:');
  console.log('   Email: admin@school.com');
  console.log('   Password: admin123');
  console.log('   Role: SUPER_ADMIN');
  console.log('');

  // Create a test department
  const department = await prisma.department.upsert({
    where: { name: 'Teknik Informatika' },
    update: {},
    create: {
      name: 'Teknik Informatika',
      description: 'Jurusan Teknik Informatika',
    },
  });

  // Create Admin Jurusan
  const adminJurusan = await prisma.user.upsert({
    where: { email: 'admin.ti@school.com' },
    update: {},
    create: {
      email: 'admin.ti@school.com',
      password: hashedPassword,
      name: 'Admin TI',
      role: 'ADMIN_JURUSAN',
      departmentId: department.id,
    },
  });

  console.log('✅ Admin Jurusan created:');
  console.log('   Email: admin.ti@school.com');
  console.log('   Password: admin123');
  console.log('   Role: ADMIN_JURUSAN');
  console.log('   Department: Teknik Informatika');
  console.log('');

  // Create regular user
  const user = await prisma.user.upsert({
    where: { email: 'user@school.com' },
    update: {},
    create: {
      email: 'user@school.com',
      password: hashedPassword,
      name: 'Test User',
      role: 'USER',
      departmentId: department.id,
    },
  });

  console.log('✅ Regular User created:');
  console.log('   Email: user@school.com');
  console.log('   Password: admin123');
  console.log('   Role: USER');
  console.log('');

  console.log('🎉 Seeding completed!');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
