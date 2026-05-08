import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import PageHeader from '../components/ui/PageHeader';

export default function Attendance() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Check-in state
  const [labs, setLabs] = useState([]);
  const [schedules, setSchedules] = useState([]);
  const [formData, setFormData] = useState({
    labId: '',
    scheduleId: '',
  });

  // History state
  const [records, setRecords] = useState([]);
  const [activeAttendance, setActiveAttendance] = useState(null);

  // Lab attendance for admin
  const [labAttendances, setLabAttendances] = useState([]);
  const [selectedLabId, setSelectedLabId] = useState('');

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_JURUSAN';
  const isUser = user?.role === 'USER';

  useEffect(() => {
    fetchLabs();
    fetchSchedules();
    fetchHistory();
  }, []);

  const fetchLabs = async () => {
    try {
      const { data } = await api.get('/labs');
      setLabs(data.data || []);
    } catch (err) {
      console.error('Failed to fetch labs');
    }
  };

  const fetchSchedules = async () => {
    try {
      const { data } = await api.get('/schedules');
      const today = new Date().toISOString().split('T')[0];
      const todaySchedules = (data.data || []).filter(s => 
        s.date && s.date.split('T')[0] === today
      );
      setSchedules(todaySchedules);
    } catch (err) {
      console.error('Failed to fetch schedules');
    }
  };

  const fetchHistory = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/attendance/history');
      const history = data.data || [];
      setRecords(history);
      
      // Find active attendance (not checked out yet)
      const active = history.find(r => !r.checkOutTime);
      setActiveAttendance(active);
    } catch (err) {
      setError('Failed to load history');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckIn = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/attendance/check-in', {
        labId: formData.labId,
        scheduleId: formData.scheduleId || undefined,
      });
      setMessage('✅ Check-in berhasil! Selamat belajar di lab.');
      setFormData({ labId: '', scheduleId: '' });
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-in gagal. Pastikan Anda belum check-in sebelumnya.');
    } finally {
      setLoading(false);
    }
  };

  const handleCheckOut = async () => {
    if (!activeAttendance) {
      setError('Tidak ada kunjungan aktif untuk di-checkout');
      return;
    }

    if (!window.confirm('Apakah Anda yakin ingin check-out?')) return;

    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/attendance/check-out', { attendanceId: activeAttendance.id });
      setMessage('✅ Check-out berhasil! Terima kasih telah menggunakan lab.');
      fetchHistory();
    } catch (err) {
      setError(err.response?.data?.message || 'Check-out gagal');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabAttendance = async () => {
    if (!selectedLabId) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/attendance/lab/${selectedLabId}`);
      setLabAttendances(data.data || []);
    } catch (err) {
      setError('Failed to load lab attendance');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeTab === 'lab' && selectedLabId) {
      fetchLabAttendance();
    }
  }, [activeTab, selectedLabId]);

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div>
      <PageHeader
        title={isUser ? "Kunjungan Lab" : "Attendance"}
        description={isUser ? "Absensi masuk dan keluar laboratorium" : "Manage lab attendance"}
      />

      {error && <ErrorMessage message={error} />}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {message}
        </div>
      )}

      {/* Active Attendance Alert */}
      {activeAttendance && (
        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-800">
                🔵 Anda sedang berada di: <strong>{activeAttendance.lab?.name || 'Lab'}</strong>
              </p>
              <p className="text-sm text-blue-700">
                Check-in: {formatDate(activeAttendance.checkInTime)}
              </p>
            </div>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
            >
              Check-out Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`pb-2 px-2 text-sm font-medium ${
            activeTab === 'checkin'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isUser ? 'Absensi' : 'Check-in / Out'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-2 px-2 text-sm font-medium ${
            activeTab === 'history'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          {isUser ? 'Riwayat Kunjungan' : 'My History'}
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('lab')}
            className={`pb-2 px-2 text-sm font-medium ${
              activeTab === 'lab'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            Lab Attendance
          </button>
        )}
      </div>

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            {activeAttendance ? 'Check-out dari Lab' : 'Check-in ke Lab'}
          </h2>

          {!activeAttendance ? (
            <form onSubmit={handleCheckIn} className="max-w-md space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Lab *
                </label>
                <select
                  required
                  value={formData.labId}
                  onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Pilih Lab --</option>
                  {labs.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jadwal (Opsional)
                </label>
                <select
                  value={formData.scheduleId}
                  onChange={(e) => setFormData({ ...formData, scheduleId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Tidak ada jadwal --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.lab?.name} - {schedule.startTime} ({schedule.title || 'Praktikum'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Pilih jadwal jika Anda mengikuti kelas praktikum
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 font-medium"
              >
                {loading ? 'Memproses...' : '✓ Check-in Sekarang'}
              </button>
            </form>
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">
                Anda sudah check-in. Gunakan tombol di atas untuk check-out.
              </p>
            </div>
          )}
        </div>
      )}

      {/* History Tab */}
      {activeTab === 'history' && (
        <div className="bg-white shadow rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : records.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              Belum ada riwayat kunjungan lab
            </div>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Lab
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {records.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {record.lab?.name || '-'}
                      </div>
                      {record.schedule && (
                        <div className="text-xs text-gray-500">
                          {record.schedule.title || 'Praktikum'}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? formatDate(record.checkOutTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkOutTime ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Selesai
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Aktif
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {/* Lab Attendance Tab (Admin Only) */}
      {activeTab === 'lab' && isAdmin && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Lab
            </label>
            <select
              value={selectedLabId}
              onChange={(e) => setSelectedLabId(e.target.value)}
              className="w-full max-w-md px-3 py-2 border border-gray-300 rounded-md"
            >
              <option value="">-- Select Lab --</option>
              {labs.map((lab) => (
                <option key={lab.id} value={lab.id}>
                  {lab.name}
                </option>
              ))}
            </select>
          </div>

          {loading ? (
            <LoadingSpinner />
          ) : labAttendances.length === 0 ? (
            <p className="text-center text-gray-500">No attendance records for this lab</p>
          ) : (
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-in
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Check-out
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {labAttendances.map((record) => (
                  <tr key={record.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {record.user?.name || '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDate(record.checkInTime)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {record.checkOutTime ? formatDate(record.checkOutTime) : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {record.checkOutTime ? (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                          Active
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  );
}
