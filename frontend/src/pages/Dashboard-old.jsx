import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAuth from '../hooks/useAuth';
import api from '../config/axios';
import LoadingSpinner from '../components/ui/LoadingSpinner';

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
        // Fetch stats for admin
        if (isAdmin) {
          setStats({
            labs: 8,
            pendingLoans: 3,
            todayAttendance: 45,
          });
        }
        
        // Fetch today's schedules for all users
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
      <div>
        <div className="mb-6">
          <h1 className="text-2xl font-semibold text-gray-900">
            Selamat Datang, {user?.name} 👋
          </h1>
          <p className="text-gray-500 text-sm mt-1">Sistem Manajemen Laboratorium Sekolah</p>
        </div>

        {/* Pengumuman */}
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Pengumuman</h3>
              <div className="mt-2 text-sm text-blue-700">
                <p>• Pastikan mengisi absensi kunjungan lab sebelum masuk</p>
                <p>• Peminjaman barang maksimal 7 hari</p>
                <p>• Jaga kebersihan dan ketertiban laboratorium</p>
              </div>
            </div>
          </div>
        </div>

        {/* Jadwal Lab Hari Ini */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Jadwal Lab Hari Ini</h2>
          {schedules.length === 0 ? (
            <p className="text-gray-500 text-sm">Tidak ada jadwal lab hari ini</p>
          ) : (
            <div className="space-y-3">
              {schedules.map((schedule) => (
                <div key={schedule.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="font-medium text-gray-900">{schedule.lab?.name || 'Lab'}</p>
                      <p className="text-sm text-gray-600">{schedule.title || 'Praktikum'}</p>
                      <p className="text-sm text-gray-500">
                        Guru: {schedule.creator?.name || '-'}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-medium text-indigo-600">
                        {schedule.startTime} - {schedule.endTime}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Tata Tertib Lab */}
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📋 Tata Tertib Laboratorium</h2>
          <div className="space-y-2 text-sm text-gray-700">
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <p>Wajib mengisi absensi kunjungan saat masuk dan keluar lab</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <p>Gunakan jas lab dan sepatu tertutup saat praktikum</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <p>Jaga kebersihan dan kerapihan laboratorium</p>
            </div>
            <div className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <p>Kembalikan alat dan bahan ke tempat semula setelah digunakan</p>
            </div>
            <div className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <p>Dilarang makan dan minum di dalam laboratorium</p>
            </div>
            <div className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <p>Dilarang membawa barang berharga yang tidak diperlukan</p>
            </div>
            <div className="flex items-start">
              <span className="text-red-500 mr-2">✗</span>
              <p>Dilarang menggunakan alat lab tanpa izin guru/laboran</p>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/attendance" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-indigo-500 text-white text-2xl">
                  ✅
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Kunjungan Lab</h4>
                <p className="text-sm text-gray-500">Absensi masuk dan keluar lab</p>
              </div>
            </div>
          </Link>
          <Link to="/loans" className="block p-6 bg-white rounded-lg shadow hover:shadow-md transition">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-12 w-12 rounded-md bg-green-500 text-white text-2xl">
                  📋
                </div>
              </div>
              <div className="ml-4">
                <h4 className="text-lg font-medium text-gray-900">Peminjaman Barang</h4>
                <p className="text-sm text-gray-500">Ajukan peminjaman alat lab</p>
              </div>
            </div>
          </Link>
        </div>

        {/* Tips Penggunaan */}
        <div className="mt-6 bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-sm font-medium text-yellow-800 mb-2">💡 Tips Penggunaan Sistem</h3>
          <ul className="text-sm text-yellow-700 space-y-1">
            <li>• Gunakan menu <strong>Kunjungan Lab</strong> untuk check-in saat masuk lab</li>
            <li>• Jangan lupa check-out setelah selesai menggunakan lab</li>
            <li>• Ajukan peminjaman barang minimal 1 hari sebelumnya</li>
            <li>• Kembalikan barang tepat waktu untuk menghindari sanksi</li>
          </ul>
        </div>
      </div>
    );
  }

  // Dashboard untuk ADMIN
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-semibold text-gray-900">
          Welcome, {user?.name} 👋
        </h1>
        <p className="text-gray-500 text-sm mt-1">Role: {user?.role}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Labs</h3>
          <p className="text-3xl font-bold text-indigo-600">{stats?.labs}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pending Loans</h3>
          <p className="text-3xl font-bold text-amber-600">{stats?.pendingLoans}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Today's Attendance</h3>
          <p className="text-3xl font-bold text-green-600">{stats?.todayAttendance}</p>
        </div>
      </div>

      {/* Jadwal Hari Ini untuk Admin */}
      {schedules.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📅 Jadwal Lab Hari Ini</h2>
          <div className="space-y-3">
            {schedules.map((schedule) => (
              <div key={schedule.id} className="border-l-4 border-indigo-500 pl-4 py-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="font-medium text-gray-900">{schedule.lab?.name || 'Lab'}</p>
                    <p className="text-sm text-gray-600">{schedule.title || 'Praktikum'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-indigo-600">
                      {schedule.startTime} - {schedule.endTime}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick shortcuts based on role */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/labs" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition">
          <h4 className="font-medium">🧪 Manage Labs</h4>
          <p className="text-sm text-gray-500">View and manage laboratories</p>
        </Link>
        <Link to="/loans" className="block p-4 bg-white rounded-lg shadow hover:shadow-md transition">
          <h4 className="font-medium">📋 Loan Requests</h4>
          <p className="text-sm text-gray-500">Approve or reject loan requests</p>
        </Link>
      </div>
    </div>
  );
}