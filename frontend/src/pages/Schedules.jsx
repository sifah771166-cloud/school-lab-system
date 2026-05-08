import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SearchFilter from '../components/ui/SearchFilter';
import { exportToCSV, printReport } from '../utils/export';

export default function Schedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [labs, setLabs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');
  const [form, setForm] = useState({
    title: '',
    labId: '',
    date: '',
    startTime: '',
    endTime: '',
  });

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_JURUSAN';

  const fetchSchedules = async () => {
    try {
      const { data } = await api.get('/schedules');
      setSchedules(data.data || data.schedules || []);
      setError('');
    } catch (err) {
      setError('Failed to load schedules');
    } finally {
      setLoading(false);
    }
  };

  const fetchLabs = async () => {
    try {
      const { data } = await api.get('/labs');
      setLabs(data.data || data.labs || []);
    } catch (err) {
      console.error('Failed to load labs:', err);
    }
  };

  useEffect(() => {
    fetchSchedules();
    fetchLabs();
  }, []);

  const openCreate = () => {
    setForm({ title: '', labId: '', date: '', startTime: '', endTime: '' });
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    const date = s.date ? s.date.split('T')[0] : '';
    setForm({ 
      title: s.title || '', 
      labId: s.labId, 
      date, 
      startTime: s.startTime, 
      endTime: s.endTime 
    });
    setEditData(s);
    setModalOpen(true);
  };

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.put(`/schedules/${editData.id}`, form);
      } else {
        await api.post('/schedules', form);
      }
      setModalOpen(false);
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/schedules/${id}`);
      fetchSchedules();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  // Format date nicely
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'short', 
      day: 'numeric', 
      month: 'short', 
      year: 'numeric' 
    });
  };

  // Filter schedules by date
  const filterByDate = (schedule) => {
    if (dateFilter === 'all') return true;
    
    const scheduleDate = new Date(schedule.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (dateFilter === 'today') {
      const scheduleDateOnly = new Date(scheduleDate);
      scheduleDateOnly.setHours(0, 0, 0, 0);
      return scheduleDateOnly.getTime() === today.getTime();
    }
    
    if (dateFilter === 'week') {
      const weekFromNow = new Date(today);
      weekFromNow.setDate(today.getDate() + 7);
      return scheduleDate >= today && scheduleDate <= weekFromNow;
    }
    
    return true;
  };

  // Filter schedules by search term
  const filteredSchedules = schedules
    .filter(filterByDate)
    .filter((schedule) => {
      if (!searchTerm) return true;
      const search = searchTerm.toLowerCase();
      return (
        schedule.title?.toLowerCase().includes(search) ||
        schedule.lab?.name?.toLowerCase().includes(search) ||
        schedule.createdBy?.name?.toLowerCase().includes(search)
      );
    });

  // Export to CSV
  const handleExportCSV = () => {
    const csvData = filteredSchedules.map((s) => ({
      Date: formatDate(s.date),
      'Start Time': s.startTime,
      'End Time': s.endTime,
      Lab: s.lab?.name || s.labId,
      Title: s.title || '-',
      'Created By': s.createdBy?.name || '-',
    }));
    exportToCSV(csvData, 'schedules');
  };

  // Print table
  const handlePrint = () => {
    const headers = ['Date', 'Time', 'Lab', 'Title', 'Created By'];
    const rows = filteredSchedules.map((s) => [
      formatDate(s.date),
      `${s.startTime} - ${s.endTime}`,
      s.lab?.name || s.labId,
      s.title || '-',
      s.createdBy?.name || '-',
    ]);
    printReport('Schedules', headers, rows);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Schedules"
        action={
          <div className="flex gap-2">
            {isAdmin && (
              <>
                <button
                  onClick={handleExportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Export CSV
                </button>
                <button
                  onClick={handlePrint}
                  className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200 flex items-center gap-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
                  </svg>
                  Print
                </button>
                <button
                  onClick={openCreate}
                  className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Add Schedule
                </button>
              </>
            )}
          </div>
        }
      />

      <ErrorMessage message={error} />

      {/* Search and Filter */}
      <div className="bg-white rounded-lg shadow-md p-4 space-y-4">
        <SearchFilter
          searchTerm={searchTerm}
          onSearchChange={setSearchTerm}
          placeholder="Search by title, lab name, or creator..."
        />
        
        <div className="flex gap-2">
          <button
            onClick={() => setDateFilter('all')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              dateFilter === 'all'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setDateFilter('today')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              dateFilter === 'today'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setDateFilter('week')}
            className={`px-4 py-2 rounded-lg transition-colors duration-200 ${
              dateFilter === 'week'
                ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            This Week
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white shadow-lg rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-600">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Date
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Time
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Lab
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                Created By
              </th>
              {isAdmin && (
                <th className="px-6 py-4 text-right text-xs font-semibold text-white uppercase tracking-wider">
                  Actions
                </th>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 bg-white">
            {filteredSchedules.map((s) => (
              <tr
                key={s.id}
                className="hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-colors duration-150"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                  {formatDate(s.date)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <div className="flex gap-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {s.startTime}
                    </span>
                    <span className="text-gray-400">→</span>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                      {s.endTime}
                    </span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {s.lab?.name || s.labId}
                  </span>
                </td>
                <td className="px-6 py-4 text-sm text-gray-700">
                  {s.title || <span className="text-gray-400 italic">No title</span>}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700">
                  {s.createdBy?.name || '-'}
                </td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-3">
                    <button
                      onClick={() => openEdit(s)}
                      className="text-indigo-600 hover:text-indigo-900 font-semibold transition-colors duration-150"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(s.id)}
                      className="text-red-600 hover:text-red-900 font-semibold transition-colors duration-150"
                    >
                      Delete
                    </button>
                  </td>
                )}
              </tr>
            ))}
            {filteredSchedules.length === 0 && (
              <tr>
                <td
                  colSpan={isAdmin ? 6 : 5}
                  className="px-6 py-8 text-center text-sm text-gray-500"
                >
                  <div className="flex flex-col items-center gap-2">
                    <svg className="w-12 h-12 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <p className="font-medium">No schedules found</p>
                    <p className="text-xs text-gray-400">
                      {searchTerm || dateFilter !== 'all'
                        ? 'Try adjusting your filters'
                        : 'Create your first schedule to get started'}
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md transform transition-all">
            <div className="bg-gradient-to-r from-purple-600 to-indigo-600 px-6 py-4 rounded-t-lg">
              <h2 className="text-xl font-semibold text-white">
                {editData ? 'Edit Schedule' : 'New Schedule'}
              </h2>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title (Optional)
                </label>
                <input
                  name="title"
                  value={form.title}
                  onChange={handleChange}
                  placeholder="e.g., Physics Lab Session"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lab <span className="text-red-500">*</span>
                </label>
                <select
                  name="labId"
                  value={form.labId}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                >
                  <option value="">Select Lab</option>
                  {labs.map((lab) => (
                    <option key={lab.id} value={lab.id}>
                      {lab.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date <span className="text-red-500">*</span>
                </label>
                <input
                  name="date"
                  type="date"
                  value={form.date}
                  onChange={handleChange}
                  required
                  className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="startTime"
                    type="time"
                    value={form.startTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    End Time <span className="text-red-500">*</span>
                  </label>
                  <input
                    name="endTime"
                    type="time"
                    value={form.endTime}
                    onChange={handleChange}
                    required
                    className="w-full border border-gray-300 rounded-lg px-4 py-2.5 focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-200"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-6 py-2.5 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 transition-colors duration-200 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition-all duration-200 shadow-md hover:shadow-lg font-medium"
                >
                  {editData ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
