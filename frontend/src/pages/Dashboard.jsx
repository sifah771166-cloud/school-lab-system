import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../config/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import StatCard from '../components/ui/StatCard';

export default function Dashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);

  const isUser = user?.role === 'USER';
  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_JURUSAN';

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (isAdmin) {
          // Fetch real stats from API
          const [labsRes, loansRes, attendanceRes] = await Promise.all([
            api.get('/labs'),
            api.get('/loans'),
            api.get('/attendance'),
          ]);

          const labs = labsRes.data.data || [];
          const loans = loansRes.data.data || [];
          const attendance = attendanceRes.data.data || [];

          const today = new Date().toISOString().split('T')[0];
          const todayAttendance = attendance.filter(a => 
            a.date && a.date.split('T')[0] === today
          );
          const pendingLoans = loans.filter(l => l.status === 'DIPINJAM');

          setStats({
            labs: labs.length,
            pendingLoans: pendingLoans.length,
            todayAttendance: todayAttendance.length,
            totalLoans: loans.length,
          });
        }
        
        // Fetch today's schedules
        const { data } = await api.get('/schedules');
        const today = new Date().toISOString().split('T')[0];
        const todaySchedules = (data.data || []).filter(s => 
          s.date && s.date.split('T')[0] === today
        );
        setSchedules(todaySchedules);
      } catch (err) {
        console.error('Failed to fetch data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [isAdmin]);

  if (loading) return <LoadingSpinner />;

  // Dashboard untuk USER
  if (isUser) {
    return (
      <div className="space-y-6">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
          <h1 className="text-3xl font-bold mb-2">
            Selamat Datang, {user?.name} 👋
          </h1>
          <p className="text-purple-100">Sistem Manajemen Laboratorium Sekolah</p>
        </div>

        {/* Info Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Pengumuman */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl">
                📢
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-3">Pengumuman</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <p>Pastikan mengisi absensi kunjungan lab sebelum masuk</p>
              </div>
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <p>Peminjaman barang maksimal 7 hari</p>
              </div>
              <div className="flex items-start">
                <span className="text-blue-500 mr-2">•</span>
                <p>Jaga kebersihan dan ketertiban laboratorium</p>
              </div>
            </div>
          </div>

          {/* Informasi Penting */}
          <div className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl">
                ℹ️
              </div>
              <h3 className="text-lg font-semibold text-gray-800 ml-3">Informasi Penting</h3>
            </div>
            <div className="space-y-3 text-sm text-gray-600">
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p>Wajib mengisi form kunjungan setiap kali mengajar di lab</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p>Peralatan yang dipinjam harus dikembalikan tepat waktu</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 mr-2">✓</span>
                <p>Hubungi admin jika ada kendala atau pertanyaan</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jadwal Lab Hari Ini */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📅</span>
            Jadwal Lab Hari Ini
          </h2>
          {schedules.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <p className="text-lg">Tidak ada jadwal lab hari ini</p>
            </div>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4 hover:bg-purple-100 transition-colors">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{schedule.lab?.name || 'Lab'}</p>
                      <p className="text-sm text-gray-700 mt-1">{schedule.title || 'Praktikum'}</p>
                      <p className="text-sm text-gray-600 mt-1">
                        Guru: {schedule.creator?.name || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-purple-600">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tata Tertib */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Tata Tertib Laboratorium
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <p className="text-sm text-gray-700">Wajib mengisi absensi kunjungan saat masuk dan keluar lab</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <p className="text-sm text-gray-700">Jaga kebersihan dan kerapihan laboratorium</p>
              </div>
              <div className="flex items-start">
                <span className="text-green-500 text-xl mr-3">✓</span>
                <p className="text-sm text-gray-700">Kembalikan alat dan bahan ke tempat semula setelah digunakan</p>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-3">✗</span>
                <p className="text-sm text-gray-700">Dilarang makan dan minum di dalam laboratorium</p>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-3">✗</span>
                <p className="text-sm text-gray-700">Dilarang membawa barang berharga yang tidak diperlukan</p>
              </div>
              <div className="flex items-start">
                <span className="text-red-500 text-xl mr-3">✗</span>
                <p className="text-sm text-gray-700">Dilarang menggunakan alat lab tanpa izin guru/laboran</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Link to="/attendance" className="group">
            <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">✅ Kunjungan Lab</h3>
                  <p className="text-blue-100 text-sm">Absensi masuk dan keluar lab</p>
                </div>
                <div className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </div>
          </Link>

          <Link to="/loans" className="group">
            <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-xl font-semibold mb-2">📋 Peminjaman Barang</h3>
                  <p className="text-purple-100 text-sm">Ajukan peminjaman alat lab</p>
                </div>
                <div className="text-4xl opacity-50 group-hover:opacity-100 transition-opacity">
                  →
                </div>
              </div>
            </div>
          </Link>
        </div>

        {/* Tips */}
        <div className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-xl shadow-md p-6 border border-yellow-200">
          <h3 className="text-lg font-semibold text-gray-800 mb-3 flex items-center">
            <span className="text-2xl mr-2">💡</span>
            Tips Penggunaan Sistem
          </h3>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <p><strong>Kunjungan:</strong> Isi nama guru, kelas yang diajar, dan jam mulai-selesai</p>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <p><strong>Peminjaman:</strong> Pilih barang yang tersedia dan tentukan jumlah</p>
            </li>
            <li className="flex items-start">
              <span className="text-yellow-600 mr-2">•</span>
              <p><strong>Pengembalian:</strong> Klik tombol "Kembali" setelah selesai menggunakan</p>
            </li>
          </ul>
        </div>
      </div>
    );
  }

  // Dashboard untuk ADMIN
  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-purple-600 to-indigo-600 rounded-xl shadow-lg p-8 text-white">
        <h1 className="text-3xl font-bold mb-2">
          Dashboard Admin
        </h1>
        <p className="text-purple-100">Selamat datang, {user?.name}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          icon="🧪"
          title="Total Labs"
          value={stats?.labs || 0}
          color="primary"
        />
        <StatCard
          icon="📦"
          title="Peminjaman Aktif"
          value={stats?.pendingLoans || 0}
          color="warning"
        />
        <StatCard
          icon="✅"
          title="Kunjungan Hari Ini"
          value={stats?.todayAttendance || 0}
          color="success"
        />
        <StatCard
          icon="📋"
          title="Total Peminjaman"
          value={stats?.totalLoans || 0}
          color="info"
        />
      </div>

      {/* Jadwal Lab Hari Ini */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4 flex items-center">
          <span className="text-2xl mr-2">📅</span>
          Jadwal Lab Hari Ini
        </h2>
        {schedules.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p className="text-lg">Tidak ada jadwal lab hari ini</p>
          </div>
        ) : (
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border-l-4 border-purple-500 bg-purple-50 rounded-r-lg p-4 hover:bg-purple-100 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <p className="font-semibold text-gray-900">{schedule.lab?.name || 'Lab'}</p>
                    <p className="text-sm text-gray-700 mt-1">{schedule.title || 'Praktikum'}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Guru: {schedule.creator?.name || '-'}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-purple-600">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link to="/labs" className="group">
          <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl shadow-md p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">🧪 Manage Labs</h3>
                <p className="text-blue-100 text-sm">View and manage laboratories</p>
              </div>
              <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          </div>
        </Link>

        <Link to="/items" className="group">
          <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl shadow-md p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">📦 Manage Items</h3>
                <p className="text-purple-100 text-sm">View and manage lab items</p>
              </div>
              <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          </div>
        </Link>

        <Link to="/loans" className="group">
          <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-md p-6 text-white hover:shadow-xl transition-all transform hover:-translate-y-1">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold mb-1">📋 Loan Requests</h3>
                <p className="text-green-100 text-sm">Approve or reject requests</p>
              </div>
              <div className="text-3xl opacity-50 group-hover:opacity-100 transition-opacity">
                →
              </div>
            </div>
          </div>
        </Link>
      </div>
    </div>
  );
}
