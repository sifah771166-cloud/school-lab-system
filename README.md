# School Laboratory Management System

A modern, multi-department, role-based web application for managing school laboratories, inventory, schedules, attendance (kunjungan), and item loans.

Sistem ini dibuat untuk sekolah kejuruan dan universitas dengan kebutuhan:
- beberapa jurusan (departments)
- admin jurusan yang hanya mengelola jurusannya sendiri
- super admin yang mengelola seluruh sistem
- user biasa yang bisa melakukan kunjungan dan peminjaman barang

## Status Saat Ini
- Frontend: running di `http://localhost`
- Backend API: running di `http://localhost:5001/api/v1`
- PostgreSQL: running di `localhost:5432`
- Aplikasi sudah ter-deploy dengan Docker Compose dan siap dipakai.

## Struktur Singkat
- `backend/` - API Express.js + Prisma + PostgreSQL
- `frontend/` - React + Vite + Tailwind CSS
- `docker-compose.yml` - layanan frontend, backend, database

## Fitur Utama
- Role-based access control (RBAC)
- Multi-department / multi-lab support
- Manajemen lab, item, jadwal, attendance, dan peminjaman
- JWT authentication + bcrypt password hashing
- Validasi input backend dengan Zod
- Proteksi route frontend menurut role
- Export CSV dan print pada beberapa halaman admin
- Sidebar dinamis sesuai role
- Dockerized deployment

## Role dan Akses
### SUPER_ADMIN
- Akses penuh ke semua fitur
- Lihat/kelola semua jurusan, lab, barang, jadwal, kunjungan, dan peminjaman
- Bisa membuat user baru

### ADMIN_JURUSAN
- Akses hanya untuk jurusannya sendiri
- Kelola lab, barang, jadwal, dan kunjungan di jurusan sendiri
- Tidak bisa mengakses data jurusan lain

### USER
- Akses terbatas
- Dashboard informasi
- Kunjungan (attendance)
- Peminjaman barang (loans)
- Tidak bisa akses halaman admin jurusan atau super admin

## Kredensial Default
Password akun sekarang dibedakan per role dan per jurusan.

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

## Cara Menjalankan
### Jalankan dengan Docker Compose
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

### Jalankan Seed Data
Jika ingin memperbarui akun ke kredensial baru, jalankan seed di backend:
```bash
cd backend
npm run prisma:seed
```

## Catatan Penting
- Ganti password default segera setelah login pertama kali
- Untuk production, ganti `JWT_SECRET` di konfigurasi environment
- Backup database secara berkala
- Jika port 80, 5001, atau 5432 konflik, ubah port pada `docker-compose.yml`

## Multi-Department dan Kunjungan
- Sistem mendukung 7 jurusan dengan lab khusus untuk masing-masing jurusan
- Admin jurusan hanya melihat data jurusan sendiri
- Kunjungan (attendance) dibuat sebagai catatan kunjungan sederhana dengan field: nama guru, kelas yang diajar, jam mulai, jam selesai, dan tanggal
- Super admin bisa melihat semua kunjungan; admin jurusan hanya bisa melihat kunjungan jurusannya

## Pengujian dan Verifikasi
- Semua admin jurusan sudah diverifikasi berfungsi sesuai role
- Role isolation sudah diuji: admin tidak bisa mengakses jurusan lain
- Sidebar dan route sudah disesuaikan dengan role
- Fitur attendance, peminjaman, dan manajemen inventaris sudah berjalan

## Troubleshooting
### Tidak bisa akses frontend
1. Cek status container:
   ```bash
docker-compose ps
```
2. Cek logs frontend:
   ```bash
docker-compose logs -f frontend
```
3. Jika cache browser bermasalah, refresh paksa `Cmd+Shift+R`

### Tidak bisa akses API
1. Cek port backend 5001:
   ```bash
docker-compose ps
```
2. Cek logs backend:
   ```bash
docker-compose logs -f backend
```

### Database error
1. Cek logs PostgreSQL:
   ```bash
docker-compose logs -f postgres
```
2. Jalankan migration jika perlu:
   ```bash
cd backend
npx prisma migrate deploy
```
