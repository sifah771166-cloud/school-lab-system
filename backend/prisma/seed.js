const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

const departments = [
  {
    name: 'TKJ',
    description: 'Teknik Komputer dan Jaringan',
    labs: ['Lab Komputer TKJ 1', 'Lab Komputer TKJ 2', 'Lab Jaringan TKJ', 'Ruang Guru TKJ'],
    adminEmail: 'admin.tkj@school.com',
    adminPassword: 'admintkj123',
    users: [
      { email: 'usertkj1@school.com', password: 'usertkj1', name: 'User TKJ 1' },
      { email: 'usertkj2@school.com', password: 'usertkj2', name: 'User TKJ 2' },
      { email: 'usertkj3@school.com', password: 'usertkj3', name: 'User TKJ 3' },
      { email: 'usertkj4@school.com', password: 'usertkj4', name: 'User TKJ 4' },
    ],
  },
  {
    name: 'DKV',
    description: 'Desain Komunikasi Visual',
    labs: ['Lab Komputer DKV 1', 'Lab Komputer DKV 2', 'Ruang Broadcast DKV', 'Ruang Guru DKV'],
    adminEmail: 'admin.dkv@school.com',
    adminPassword: 'admindkv123',
    users: [
      { email: 'userdkv1@school.com', password: 'userdkv1', name: 'User DKV 1' },
      { email: 'userdkv2@school.com', password: 'userdkv2', name: 'User DKV 2' },
      { email: 'userdkv3@school.com', password: 'userdkv3', name: 'User DKV 3' },
      { email: 'userdkv4@school.com', password: 'userdkv4', name: 'User DKV 4' },
    ],
  },
  {
    name: 'BD',
    description: 'Bisnis Digital',
    labs: ['Lab Komputer BD', 'Ruang Guru BD'],
    adminEmail: 'admin.bd@school.com',
    adminPassword: 'adminbd123',
    users: [
      { email: 'userbd1@school.com', password: 'userbd1', name: 'User BD 1' },
      { email: 'userbd2@school.com', password: 'userbd2', name: 'User BD 2' },
    ],
  },
  {
    name: 'DPIB',
    description: 'Desain Pemodelan dan Informasi Bangunan',
    labs: ['Lab Komputer DPIB', 'Ruang Guru DPIB'],
    adminEmail: 'admin.dpib@school.com',
    adminPassword: 'admindpib123',
    users: [
      { email: 'userdpib1@school.com', password: 'userdpib1', name: 'User DPIB 1' },
      { email: 'userdpib2@school.com', password: 'userdpib2', name: 'User DPIB 2' },
    ],
  },
  {
    name: 'TKR',
    description: 'Teknik Kendaraan Ringan',
    labs: ['Lab TKR Lama', 'Ruang Guru TKR Lama', 'Lab TKR Baru', 'Ruang Guru TKR Baru'],
    adminEmail: 'admin.tkr@school.com',
    adminPassword: 'admintkr123',
    users: [
      { email: 'usertkr1@school.com', password: 'usertkr1', name: 'User TKR 1' },
      { email: 'usertkr2@school.com', password: 'usertkr2', name: 'User TKR 2' },
      { email: 'usertkr3@school.com', password: 'usertkr3', name: 'User TKR 3' },
      { email: 'usertkr4@school.com', password: 'usertkr4', name: 'User TKR 4' },
    ],
  },
  {
    name: 'TSM',
    description: 'Teknik Sepeda Motor',
    labs: ['Lab TSM', 'Ruang Guru TSM'],
    adminEmail: 'admin.tsm@school.com',
    adminPassword: 'admintsm123',
    users: [
      { email: 'usertsm1@school.com', password: 'usertsm1', name: 'User TSM 1' },
      { email: 'usertsm2@school.com', password: 'usertsm2', name: 'User TSM 2' },
    ],
  },
  {
    name: 'Lab Umum',
    description: 'Lab Umum',
    labs: ['Lab Komputer Umum', 'Ruang Toolman Lab Umum'],
    adminEmail: 'admin.umum@school.com',
    adminPassword: 'adminumum123',
    users: [
      { email: 'userumum1@school.com', password: 'userumum1', name: 'User Umum 1' },
      { email: 'userumum2@school.com', password: 'userumum2', name: 'User Umum 2' },
    ],
  },
];

async function main() {
  console.log('🌱 Seeding database with distinct passwords...');

  const superAdminPassword = await bcrypt.hash('superadmin123', 12);

  await prisma.user.upsert({
    where: { email: 'admin@school.com' },
    update: {
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
      departmentId: null,
    },
    create: {
      email: 'admin@school.com',
      password: superAdminPassword,
      name: 'Super Admin',
      role: 'SUPER_ADMIN',
    },
  });

  for (const departmentData of departments) {
    const department = await prisma.department.upsert({
      where: { name: departmentData.name },
      update: { description: departmentData.description },
      create: {
        name: departmentData.name,
        description: departmentData.description,
      },
    });

    for (const labName of departmentData.labs) {
      await prisma.lab.upsert({
        where: {
          name_departmentId: {
            name: labName,
            departmentId: department.id,
          },
        },
        update: {},
        create: {
          name: labName,
          description: `${labName} untuk ${departmentData.name}`,
          departmentId: department.id,
        },
      });
    }

    const adminPasswordHash = await bcrypt.hash(departmentData.adminPassword, 12);
    await prisma.user.upsert({
      where: { email: departmentData.adminEmail },
      update: {
        password: adminPasswordHash,
        name: `Admin ${departmentData.name}`,
        role: 'ADMIN_JURUSAN',
        departmentId: department.id,
      },
      create: {
        email: departmentData.adminEmail,
        password: adminPasswordHash,
        name: `Admin ${departmentData.name}`,
        role: 'ADMIN_JURUSAN',
        departmentId: department.id,
      },
    });

    for (const userData of departmentData.users) {
      const hashedPassword = await bcrypt.hash(userData.password, 12);
      await prisma.user.upsert({
        where: { email: userData.email },
        update: {
          password: hashedPassword,
          name: userData.name,
          role: 'USER',
          departmentId: department.id,
        },
        create: {
          email: userData.email,
          password: hashedPassword,
          name: userData.name,
          role: 'USER',
          departmentId: department.id,
        },
      });
    }
  }

  console.log('✅ All accounts seeded with distinct passwords');
  console.log('Super Admin: admin@school.com / superadmin123');
  for (const department of departments) {
    console.log(`Admin ${department.name}: ${department.adminEmail} / ${department.adminPassword}`);
    for (const user of department.users) {
      console.log(`User: ${user.email} / ${user.password}`);
    }
  }
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
