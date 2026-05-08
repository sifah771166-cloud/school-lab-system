import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SearchFilter from '../components/ui/SearchFilter';
import { exportToCSV, printReport } from '../utils/export';

export default function Labs() {
  const { user } = useAuth();
  const [labs, setLabs] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({ name: '', description: '', capacity: 0, departmentId: user.departmentId || '' });
  
  // Search and filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterDepartment, setFilterDepartment] = useState('');

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_JURUSAN';

  // Filtered labs based on search and filter
  const filteredLabs = labs.filter(lab => {
    const matchesSearch = lab.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (lab.description && lab.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesDepartment = !filterDepartment || lab.departmentId === filterDepartment;
    return matchesSearch && matchesDepartment;
  });

  const fetchLabs = async () => {
    try {
      const { data } = await api.get('/labs');
      setLabs(data.data || data.labs || []);
      setError('');
    } catch (err) {
      setError('Failed to load labs');
    } finally {
      setLoading(false);
    }
  };

  const fetchDepartments = async () => {
    try {
      const { data } = await api.get('/departments');
      setDepartments(data.data || data.departments || []);
    } catch (err) {
      console.error('Failed to load departments');
    }
  };

  useEffect(() => { 
    fetchLabs(); 
    if (user.role === 'SUPER_ADMIN') {
      fetchDepartments();
    }
  }, []);

  const openCreate = () => {
    setForm({ name: '', description: '', capacity: 0, departmentId: user.departmentId || '' });
    setEditData(null);
    setModalOpen(true);
  };

  const openEdit = (lab) => {
    setForm({ name: lab.name, description: lab.description || '', capacity: lab.capacity });
    setEditData(lab);
    setModalOpen(true);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: name === 'capacity' ? Number(value) : value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.put(`/labs/${editData.id}`, form);
      } else {
        await api.post('/labs', form);
      }
      setModalOpen(false);
      fetchLabs();
    } catch (err) {
      setError(err.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this lab?')) return;
    try {
      await api.delete(`/labs/${id}`);
      fetchLabs();
    } catch (err) {
      setError(err.response?.data?.message || 'Delete failed');
    }
  };

  const handleExport = () => {
    const exportData = filteredLabs.map(lab => ({
      'Lab Name': lab.name,
      'Description': lab.description || '-',
      'Capacity': lab.capacity,
      'Department': lab.department?.name || '-'
    }));
    exportToCSV(exportData, 'labs-data');
  };

  const handlePrint = () => {
    const headers = ['Lab Name', 'Description', 'Capacity', 'Department'];
    const rows = filteredLabs.map(lab => [
      lab.name,
      lab.description || '-',
      lab.capacity,
      lab.department?.name || '-'
    ]);
    printReport('Laboratories Report', headers, rows);
  };

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Laboratories"
        action={
          isAdmin && (
            <div className="flex space-x-2">
              <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center">
                <span className="mr-2">📥</span> Export CSV
              </button>
              <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                <span className="mr-2">🖨️</span> Print
              </button>
              <button onClick={openCreate} className="bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700">
                Add Lab
              </button>
            </div>
          )
        }
      />
      <ErrorMessage message={error} />

      {/* Search and Filter */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchPlaceholder="Search labs by name or description..."
        filterValue={filterDepartment}
        onFilterChange={(e) => setFilterDepartment(e.target.value)}
        filterOptions={[
          { value: '', label: 'All Departments' },
          ...departments.map(dept => ({ value: dept.id, label: dept.name }))
        ]}
        filterPlaceholder="Filter by department"
      />

      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Description</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Capacity</th>
              <th className="px-6 py-3 text-left text-xs font-medium uppercase">Department</th>
              {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>}
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {filteredLabs.map((lab) => (
              <tr key={lab.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{lab.name}</td>
                <td className="px-6 py-4 text-sm text-gray-500">{lab.description || '-'}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.capacity}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{lab.department?.name || lab.departmentId}</td>
                {isAdmin && (
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button onClick={() => openEdit(lab)} className="text-indigo-600 hover:text-indigo-900 font-semibold">Edit</button>
                    <button onClick={() => handleDelete(lab.id)} className="text-red-600 hover:text-red-900 font-semibold">Delete</button>
                  </td>
                )}
              </tr>
            ))}
            {filteredLabs.length === 0 && (
              <tr>
                <td colSpan={isAdmin ? 5 : 4} className="px-6 py-8 text-center text-sm text-gray-500">
                  {searchTerm || filterDepartment ? 'No labs match your search criteria.' : 'No labs found.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal for Create/Edit */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h2 className="text-lg font-medium mb-4">{editData ? 'Edit Lab' : 'New Lab'}</h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <input name="name" value={form.name} onChange={handleChange} placeholder="Name" required
                className="w-full border border-gray-300 rounded px-3 py-2" />
              <textarea name="description" value={form.description} onChange={handleChange} placeholder="Description"
                className="w-full border border-gray-300 rounded px-3 py-2" />
              <input name="capacity" type="number" value={form.capacity} onChange={handleChange} placeholder="Capacity"
                className="w-full border border-gray-300 rounded px-3 py-2" />
              {/* For SUPER_ADMIN, show department select */}
              {user.role === 'SUPER_ADMIN' && (
                <select name="departmentId" value={form.departmentId} onChange={handleChange} required
                  className="w-full border border-gray-300 rounded px-3 py-2">
                  <option value="">Select Department</option>
                  {departments.map(dept => (
                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                  ))}
                </select>
              )}
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