import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import PageHeader from '../components/ui/PageHeader';
import SearchFilter from '../components/ui/SearchFilter';
import StatusBadge from '../components/ui/StatusBadge';
import { exportToCSV, printReport } from '../utils/export';

export default function Attendance() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('checkin');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  // Search and filter state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

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

  // Filter records based on search and status
  const filteredRecords = records.filter(record => {
    const matchesSearch = 
      record.lab?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.schedule?.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !record.checkOutTime) ||
      (statusFilter === 'completed' && record.checkOutTime);
    
    return matchesSearch && matchesStatus;
  });

  // Filter lab attendances
  const filteredLabAttendances = labAttendances.filter(record => {
    const matchesSearch = 
      record.user?.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      record.lab?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === 'all' ||
      (statusFilter === 'active' && !record.checkOutTime) ||
      (statusFilter === 'completed' && record.checkOutTime);
    
    return matchesSearch && matchesStatus;
  });

  // Export handlers
  const handleExportCSV = () => {
    const dataToExport = activeTab === 'history' ? filteredRecords : filteredLabAttendances;
    const csvData = dataToExport.map(record => ({
      'User': record.user?.name || '-',
      'Lab': record.lab?.name || '-',
      'Schedule': record.schedule?.title || '-',
      'Check-in': formatDate(record.checkInTime),
      'Check-out': record.checkOutTime ? formatDate(record.checkOutTime) : '-',
      'Status': record.checkOutTime ? 'Completed' : 'Active',
    }));
    exportToCSV(csvData, `attendance-${activeTab}-${new Date().toISOString().split('T')[0]}.csv`);
  };

  const handlePrint = () => {
    const dataToExport = activeTab === 'history' ? filteredRecords : filteredLabAttendances;
    const headers = ['User', 'Lab', 'Schedule', 'Check-in', 'Check-out', 'Status'];
    const rows = dataToExport.map(record => [
      record.user?.name || '-',
      record.lab?.name || '-',
      record.schedule?.title || '-',
      formatDate(record.checkInTime),
      record.checkOutTime ? formatDate(record.checkOutTime) : '-',
      record.checkOutTime ? 'Completed' : 'Active',
    ]);
    printReport(`Attendance Report - ${activeTab}`, headers, rows);
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title={isUser ? "Kunjungan Lab" : "Attendance"}
        description={isUser ? "Absensi masuk dan keluar laboratorium" : "Manage lab attendance"}
      />

      {error && <ErrorMessage message={error} />}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-4">
          {message}
        </div>
      )}

      {/* Active Attendance Alert */}
      {activeAttendance && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-500 p-4 rounded-lg shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-blue-900">
                🔵 Anda sedang berada di: <strong>{activeAttendance.lab?.name || 'Lab'}</strong>
              </p>
              <p className="text-sm text-blue-700 mt-1">
                Check-in: {formatDate(activeAttendance.checkInTime)}
              </p>
            </div>
            <button
              onClick={handleCheckOut}
              disabled={loading}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors duration-200 font-medium shadow-sm"
            >
              Check-out Sekarang
            </button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-4 mb-6 border-b border-gray-200">
        <button
          onClick={() => setActiveTab('checkin')}
          className={`pb-3 px-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'checkin'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
          }`}
        >
          {isUser ? 'Absensi' : 'Check-in / Out'}
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`pb-3 px-4 text-sm font-medium transition-colors duration-200 ${
            activeTab === 'history'
              ? 'border-b-2 border-indigo-600 text-indigo-600'
              : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
          }`}
        >
          {isUser ? 'Riwayat Kunjungan' : 'My History'}
        </button>
        {isAdmin && (
          <button
            onClick={() => setActiveTab('lab')}
            className={`pb-3 px-4 text-sm font-medium transition-colors duration-200 ${
              activeTab === 'lab'
                ? 'border-b-2 border-indigo-600 text-indigo-600'
                : 'text-gray-500 hover:text-gray-700 hover:border-b-2 hover:border-gray-300'
            }`}
          >
            Lab Attendance
          </button>
        )}
      </div>

      {/* Check-in Tab */}
      {activeTab === 'checkin' && (
        <div className="bg-white shadow-md rounded-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-6">
            {activeAttendance ? 'Check-out dari Lab' : 'Check-in ke Lab'}
          </h2>

          {!activeAttendance ? (
            <form onSubmit={handleCheckIn} className="max-w-md space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Lab *
                </label>
                <select
                  required
                  value={formData.labId}
                  onChange={(e) => setFormData({ ...formData, labId: e.target.value })}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
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
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">-- Tidak ada jadwal --</option>
                  {schedules.map((schedule) => (
                    <option key={schedule.id} value={schedule.id}>
                      {schedule.lab?.name} - {schedule.startTime} ({schedule.title || 'Praktikum'})
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-2">
                  Pilih jadwal jika Anda mengikuti kelas praktikum
                </p>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full px-4 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg hover:from-green-700 hover:to-green-800 disabled:opacity-50 disabled:cursor-not-allowed font-medium shadow-md transition-all duration-200 transform hover:scale-[1.02]"
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
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-200 bg-gray-50">
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
              <SearchFilter
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by lab, user, or schedule..."
              />
              <div className="flex gap-2 items-center">
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                >
                  <option value="all">All Status</option>
                  <option value="active">Active</option>
                  <option value="completed">Completed</option>
                </select>
                {isAdmin && (
                  <>
                    <button
                      onClick={handleExportCSV}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                      📥 Export CSV
                    </button>
                    <button
                      onClick={handlePrint}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                    >
                      🖨️ Print
                    </button>
                  </>
                )}
              </div>
            </div>
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : filteredRecords.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'Tidak ada data yang sesuai dengan filter'
                : 'Belum ada riwayat kunjungan lab'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Lab
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredRecords.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.lab?.name || '-'}
                        </div>
                        {record.schedule && (
                          <div className="text-xs text-gray-500 mt-1">
                            {record.schedule.title || 'Praktikum'}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(record.checkInTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.checkOutTime ? formatDate(record.checkOutTime) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge 
                          status={record.checkOutTime ? 'completed' : 'active'} 
                          type="attendance"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Lab Attendance Tab (Admin Only) */}
      {activeTab === 'lab' && isAdmin && (
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <div className="p-6 border-b border-gray-200 bg-gray-50 space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Select Lab
              </label>
              <select
                value={selectedLabId}
                onChange={(e) => setSelectedLabId(e.target.value)}
                className="w-full max-w-md px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all duration-200"
              >
                <option value="">-- Select Lab --</option>
                {labs.map((lab) => (
                  <option key={lab.id} value={lab.id}>
                    {lab.name}
                  </option>
                ))}
              </select>
            </div>

            {selectedLabId && (
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <SearchFilter
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by user or lab..."
                />
                <div className="flex gap-2 items-center">
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active</option>
                    <option value="completed">Completed</option>
                  </select>
                  <button
                    onClick={handleExportCSV}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                  >
                    📥 Export CSV
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200 text-sm font-medium shadow-sm"
                  >
                    🖨️ Print
                  </button>
                </div>
              </div>
            )}
          </div>

          {loading ? (
            <div className="p-6">
              <LoadingSpinner />
            </div>
          ) : !selectedLabId ? (
            <div className="p-6 text-center text-gray-500">
              Please select a lab to view attendance records
            </div>
          ) : filteredLabAttendances.length === 0 ? (
            <div className="p-6 text-center text-gray-500">
              {searchTerm || statusFilter !== 'all' 
                ? 'No records match the current filters'
                : 'No attendance records for this lab'}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Check-in
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Check-out
                    </th>
                    <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredLabAttendances.map((record) => (
                    <tr key={record.id} className="hover:bg-gray-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {record.user?.name || '-'}
                        </div>
                        {record.user?.email && (
                          <div className="text-xs text-gray-500 mt-1">
                            {record.user.email}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {formatDate(record.checkInTime)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {record.checkOutTime ? formatDate(record.checkOutTime) : '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <StatusBadge 
                          status={record.checkOutTime ? 'completed' : 'active'} 
                          type="attendance"
                        />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
