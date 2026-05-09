# School Laboratory Management System

A modern, multi-department, role-based web application untuk mengelola laboratorium sekolah kejuruan dan universitas. Sistem ini mendukung manajemen lab, inventaris, jadwal, attendance (kunjungan), dan peminjaman barang dengan level akses super admin, admin jurusan, dan user.

## 🚀 Ringkasan
- **Frontend:** React 18 + Vite + Tailwind CSS
- **Backend:** Node.js + Express.js + Prisma + PostgreSQL
- **Authentication:** JWT + bcrypt
- **Deployment:** Docker + Docker Compose
- **Role-based access control:** SUPER_ADMIN, ADMIN_JURUSAN, USER
- **Multi-department support:** 7 jurusan dengan isolasi data per jurusan

## 📌 Status Saat Ini
- Frontend: berjalan di `http://localhost`
- Backend API: berjalan di `http://localhost:5001/api/v1`
- PostgreSQL: berjalan di `localhost:5432`
- Aplikasi sudah ter-deploy dengan Docker Compose dan siap dipakai

## 🏗️ Arsitektur Sistem

### Tech Stack
| Layer | Technology | Keterangan |
|-------|------------|------------|
| Frontend | React 18 + Vite + Tailwind CSS | UI/UX modern dan responsive |
| Backend | Node.js + Express.js | RESTful API |
| Database | PostgreSQL | Penyimpanan data |
| ORM | Prisma | Manajemen schema dan migration |
| Auth | JWT + bcrypt | Otentikasi dan authorization |
| Deployment | Docker + Docker Compose | Containerized environment |

### Struktur Database Singkat
- `Users`: 27 akun total
  - 1 SUPER_ADMIN
  - 7 ADMIN_JURUSAN
  - 19 USER
- `Departments`: 7 jurusan
- `Labs`: 20 lab total
- `Items`: inventaris per lab
- `Schedules`: jadwal penggunaan lab
- `Attendance`: catatan kunjungan lab
- `Loans`: peminjaman barang

## 🎯 Fitur Utama
- Role-based access control (RBAC)
- Multi-department / multi-lab support
- CRUD labs, items, schedules, attendance, loans
- JWT authentication + bcrypt password hashing
- Validasi input backend dengan Zod
- Proteksi route frontend menurut role
## 🚀 Deployment ke Railway

### Persiapan
1. **Push kode ke GitHub**: Pastikan semua perubahan di-commit dan di-push ke repository GitHub Anda.

2. **Buat akun Railway**: Daftar di [railway.app](https://railway.app) jika belum punya.

### Deploy Database
1. Di Railway dashboard, buat project baru.
2. Tambahkan PostgreSQL database.
3. Catat DATABASE_URL dari environment variables.

### Deploy Backend
1. Buat service baru untuk backend.
2. Connect ke GitHub repo Anda.
3. Set root directory ke `backend/`.
4. Set build command: `npm ci && npx prisma generate`
5. Set start command: `npx prisma migrate deploy && npm start`
6. Set environment variables:
   - `NODE_ENV=production`
   - `PORT=5000`
   - `JWT_SECRET=<generate-random-secret>`
   - `JWT_EXPIRES_IN=7d`
   - `DATABASE_URL=<dari-postgres-service>`
   - `FRONTEND_URL=<url-frontend-nanti>`

### Deploy Frontend
1. Buat service baru untuk frontend.
2. Connect ke GitHub repo Anda.
3. Set root directory ke `frontend/`.
4. Set build command: `npm ci && npm run build`
5. Set start command: `npm run preview`
6. Set environment variables:
   - `NODE_ENV=production`
   - `VITE_API_URL=<backend-url>/api/v1`

### Konfigurasi
- Pastikan backend URL diakses oleh frontend.
- Jika perlu, enable CORS di backend untuk frontend domain.
- Test health check di `/api/v1/health`.

### Akses Aplikasi
- Frontend: URL dari Railway frontend service
- Backend API: URL dari Railway backend service + `/api/v1`

### Troubleshooting
- Cek logs di Railway dashboard.
- Pastikan DATABASE_URL benar.
- Untuk Prisma, pastikan migration berhasil dijalankan.

## 👥 Role & Permissions

### SUPER_ADMIN
- Akses penuh ke seluruh sistem
- Kelola semua departments, labs, items, schedules, attendance, loans
- Buat user baru dan kelola semua akun
- Full CRUD di semua modul

### ADMIN_JURUSAN
- Akses terbatas pada jurusan sendiri
- Kelola lab, items, schedules, attendance, dan loans untuk jurusan sendiri
- Tidak bisa mengakses data jurusan lain
- Tidak bisa membuat user baru

### USER
- Akses personal terbatas
- Melihat dashboard informasi
- Melakukan kunjungan (attendance)
- Mengajukan peminjaman barang (loans)
- Tidak bisa akses halaman admin

## 🔐 Kredensial Default
Password akun sudah dibedakan per role dan per jurusan.

### Super Admin
- Email: `admin@school.com`
- Password: `superadmin123`

### Admin Jurusan (7 akun)
- `admin.tkj@school.com` – TKJ / Password: `admintkj123`
- `admin.dkv@school.com` – DKV / Password: `admindkv123`
- `admin.bd@school.com` – BD / Password: `adminbd123`
- `admin.dpib@school.com` – DPIB / Password: `admindpib123`
- `admin.tkr@school.com` – TKR / Password: `admintkr123`
- `admin.tsm@school.com` – TSM / Password: `admintsm123`
- `admin.umum@school.com` – Lab Umum / Password: `adminumum123`

### Sample Users per Lab
- `usertkj1@school.com` / Password: `usertkj1`
- `usertkj2@school.com` / Password: `usertkj2`
- `usertkj3@school.com` / Password: `usertkj3`
- `usertkj4@school.com` / Password: `usertkj4`
- `userdkv1@school.com` / Password: `userdkv1`
- `userdkv2@school.com` / Password: `userdkv2`
- `userdkv3@school.com` / Password: `userdkv3`
- `userdkv4@school.com` / Password: `userdkv4`
- `userbd1@school.com` / Password: `userbd1`
- `userbd2@school.com` / Password: `userbd2`
- `userdpib1@school.com` / Password: `userdpib1`
- `userdpib2@school.com` / Password: `userdpib2`
- `usertkr1@school.com` / Password: `usertkr1`
- `usertkr2@school.com` / Password: `usertkr2`
- `usertkr3@school.com` / Password: `usertkr3`
- `usertkr4@school.com` / Password: `usertkr4`
- `usertsm1@school.com` / Password: `usertsm1`
- `usertsm2@school.com` / Password: `usertsm2`
- `userumum1@school.com` / Password: `userumum1`
- `userumum2@school.com` / Password: `userumum2`

## 🚀 Cara Menjalankan

### Development Mode
```bash
# Clone repository
git clone https://github.com/sifah771166-cloud/school-lab-system.git
cd school-lab-system

# Setup environment
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env

# Install dependencies
npm install
npm --prefix backend install
npm --prefix frontend install

# Start database
docker-compose up -d postgres

# Setup database
cd backend
npx prisma migrate deploy
npm run prisma:seed

# Jalankan aplikasi
npm run dev
```

### Production Mode (Docker)
```bash
docker-compose up -d
```

### Hentikan layanan
```bash
docker-compose down
```

### Restart layanan
```bash
docker-compose restart backend frontend
```

### Rebuild jika ada perubahan kode
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Menjalankan Seed Data
```bash
cd backend
npm run prisma:seed
```

## ⚙️ Konfigurasi Environment

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DATABASE_URL=postgresql://labadmin:labpass@localhost:5432/school_lab
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api/v1
```

### Docker Environment
Database credentials didefinisikan di `docker-compose.yml`:
- Username: `labadmin`
- Password: `labpass`
- Database: `school_lab`

## 📡 API Endpoints

### Authentication
- `POST /api/v1/auth/login` - Login user
- `POST /api/v1/auth/register` - Register user (SUPER_ADMIN only)

### Departments
- `GET /api/v1/departments` - List departments
- `POST /api/v1/departments` - Create department
- `PUT /api/v1/departments/:id` - Update department
- `DELETE /api/v1/departments/:id` - Delete department

### Labs
- `GET /api/v1/labs` - List labs
- `POST /api/v1/labs` - Create lab
- `PUT /api/v1/labs/:id` - Update lab
- `DELETE /api/v1/labs/:id` - Delete lab

### Items
- `GET /api/v1/items` - List items
- `POST /api/v1/items` - Create item
- `PUT /api/v1/items/:id` - Update item
- `DELETE /api/v1/items/:id` - Delete item

### Schedules
- `GET /api/v1/schedules` - List schedules
- `POST /api/v1/schedules` - Create schedule
- `PUT /api/v1/schedules/:id` - Update schedule
- `DELETE /api/v1/schedules/:id` - Delete schedule

### Attendance
- `GET /api/v1/attendance` - List attendance
- `POST /api/v1/attendance` - Create attendance
- `PUT /api/v1/attendance/:id` - Update attendance
- `DELETE /api/v1/attendance/:id` - Delete attendance

### Loans
- `GET /api/v1/loans` - List loans
- `POST /api/v1/loans` - Create loan
- `PUT /api/v1/loans/:id` - Update loan
- `DELETE /api/v1/loans/:id` - Delete loan
```

## 📁 Struktur Repository

```
school-lab-system/
├── .gitignore
├── README.md
├── info.md
├── docker-compose.yml
├── package.json
├── backend/
│   ├── .env.example
│   ├── dockerfile
│   ├── package.json
│   ├── prisma/
│   │   ├── schema.prisma
│   │   ├── seed.js
│   │   └── migrations/
│   └── src/
│       ├── app.js
│       ├── server.js
│       ├── config/
│       ├── middleware/
│       ├── modules/
│       └── utils/
└── frontend/
    ├── .env.example
    ├── dockerfile
    ├── package.json
    ├── vite.config.js
    ├── tailwind.config.js
    └── src/
        ├── App.jsx
        ├── main.jsx
        ├── components/
        ├── pages/
        ├── context/
        ├── hooks/
        ├── routes/
        ├── services/
        └── utils/
```

## 👥 Setup untuk Kolaborator

Ketika orang lain clone repository ini:

### 1. Setup Environment
```bash
# Backend
cd backend
cp .env.example .env
# Edit .env dengan database URL dan JWT secret

# Frontend
cd ../frontend
cp .env.example .env
# Edit jika perlu
```

### 2. Install Dependencies
```bash
npm install
npm --prefix backend install
npm --prefix frontend install
```

### 3. Setup Database
```bash
cd backend
npx prisma migrate deploy
npm run prisma:seed
```

### 4. Jalankan Aplikasi
```bash
npm run dev
```

## 🧪 Pengujian dan Verifikasi
- Semua admin jurusan sudah diverifikasi sesuai role
- Role isolation sudah diuji: admin tidak dapat akses data jurusan lain
- Sidebar dan route telah disesuaikan dengan level akses
- Fitur attendance, peminjaman, dan manajemen inventaris berfungsi

## 🛠️ Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
docker-compose ps

# Restart database
docker-compose restart postgres

# Reset database
docker-compose down -v
docker-compose up -d postgres
cd backend
npx prisma migrate reset --force
npm run prisma:seed
```

### Port Conflicts
```bash
# Check port usage
lsof -i :5000
lsof -i :5173
```

### Build Issues
```bash
# Clear caches
rm -rf node_modules package-lock.json
rm -rf backend/node_modules backend/package-lock.json
rm -rf frontend/node_modules frontend/package-lock.json

# Reinstall
npm install
npm --prefix backend install
npm --prefix frontend install
```

## 📈 Roadmap & Future Enhancements

### Phase 2 (Soon)
- [ ] Email notifications untuk approvals
- [ ] Dashboard analytics dengan charts
- [ ] Bulk import/export data
- [ ] API documentation dengan Swagger
- [ ] Unit tests dan integration tests

### Phase 3 (Future)
- [ ] Mobile app companion
- [ ] Real-time notifications
- [ ] Advanced reporting
- [ ] Integration dengan external systems
- [ ] Multi-language support

## 📞 Support & Contact
Untuk pertanyaan atau issue:
- review README.md untuk setup instructions
- gunakan GitHub Issues untuk bug
- buat issue baru jika menemukan bug

**Project Status**: ✅ **PRODUCTION READY**

*Last updated: 8 Mei 2026*
