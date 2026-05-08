import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';

export default function Schedules() {
  const { user } = useAuth();
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
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

  useEffect(() => { fetchSchedules(); }, []);

  const openCreate = () => {
    setForm({ title: '', labId: '', date: '', startTime: '', endTime: '' });
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (s) => {
    // assume schedule has date in ISO format, we slice for input date
    const date = s.date ? s.date.split('T')[0] : '';
    setForm({ title: s.title || '', labId: s.labId, date, startTime: s.startTime, endTime: s.endTime });
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

  if (loading) return <LoadingSpinner />;

  return (
    <div>
      <PageHeader
        title="Schedules"
        action={
          isAdmin && (
            <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
              Add Schedule
            </button>
          )
        }
      />
      <ErrorMessage message={error} />

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left">Time</th>
              <th className="px-6 py-3 text-left">Lab</th>
              <th className="px-6 py-3 text-left">Title</th>
              {isAdmin && <th className="px-6 py-3 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {schedules.map((s) => (
              <tr key={s.id}>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(s.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{s.startTime} - {s.endTime}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{s.lab?.name || s.labId}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">{s.title || '-'}</td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(s)} className="text-indigo-600 hover:text-indigo-900">Edit</button>
                    <button onClick={() => handleDelete(s.id)} className="text-red-600 hover:text-red-900">Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {schedules.length === 0 && (
              <tr><td colSpan={isAdmin ? 5 : 4} className="px-6 py-4 text-center text-sm text-gray-500">No schedules yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal - same pattern */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">{editData ? 'Edit Schedule' : 'New Schedule'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="title" value={form.title} onChange={handleChange} placeholder="Title (optional)"
                className="w-full border rounded px-3 py-2" />
              <select name="labId" value={form.labId} onChange={handleChange} required
                className="w-full border rounded px-3 py-2">
                <option value="">Select Lab</option>
                {/* You might need to fetch labs for the select; for brevity we'll allow free text */}
                <option value="lab-uuid">Lab name (example)</option>
              </select>
              <input name="date" type="date" value={form.date} onChange={handleChange} required
                className="w-full border rounded px-3 py-2" />
              <input name="startTime" type="time" value={form.startTime} onChange={handleChange} required
                className="w-full border rounded px-3 py-2" />
              <input name="endTime" type="time" value={form.endTime} onChange={handleChange} required
                className="w-full border rounded px-3 py-2" />
              <div className="flex justify-end space-x-2">
                <button type="button" onClick={() => setModalOpen(false)} className="px-4 py-2 border rounded">Cancel</button>
                <button type="submit" className="px-4 py-2 bg-indigo-600 text-white rounded">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}