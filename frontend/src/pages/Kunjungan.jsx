import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import PageHeader from '../components/ui/PageHeader';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import SearchFilter from '../components/ui/SearchFilter';
import { exportToCSV, printReport } from '../utils/export';
import toast from 'react-hot-toast';

export default function Kunjungan() {
  const { user } = useAuth();
  const [kunjungan, setKunjungan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [form, setForm] = useState({
    teacherName: '',
    classTeaching: '',
    startTime: '',
    endTime: '',
    visitDate: new Date().toISOString().split('T')[0]
  });

  // Search state
  const [searchTerm, setSearchTerm] = useState('');

  const isAdmin = user.role === 'SUPER_ADMIN' || user.role === 'ADMIN_JURUSAN';

  useEffect(() => {
    fetchKunjungan();
  }, []);

  const fetchKunjungan = async () => {
    try {
      setLoading(true);
      const response = await api.get('/attendance');
      setKunjungan(response.data.data || []);
      setError('');
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal memuat data kunjungan');
      toast.error('Gagal memuat data kunjungan');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editData) {
        await api.put(`/attendance/${editData.id}`, form);
        toast.success('Kunjungan berhasil diperbarui');
      } else {
        await api.post('/attendance', form);
        toast.success('Kunjungan berhasil ditambahkan');
      }
      fetchKunjungan();
      handleCloseModal();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menyimpan kunjungan');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Apakah Anda yakin ingin menghapus kunjungan ini?')) return;
    
    try {
      await api.delete(`/attendance/${id}`);
      toast.success('Kunjungan berhasil dihapus');
      fetchKunjungan();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Gagal menghapus kunjungan');
    }
  };

  const handleEdit = (item) => {
    setEditData(item);
    setForm({
      teacherName: item.teacherName,
      classTeaching: item.classTeaching,
      startTime: item.startTime,
      endTime: item.endTime,
      visitDate: item.visitDate
    });
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setEditData(null);
    setForm({
      teacherName: '',
      classTeaching: '',
      startTime: '',
      endTime: '',
      visitDate: new Date().toISOString().split('T')[0]
    });
  };

  const handleExportCSV = () => {
    const csvData = filteredKunjungan.map(item => ({
      'Nama Guru': item.teacherName,
      'Kelas Diajar': item.classTeaching,
      'Jam Mulai': item.startTime,
      'Jam Selesai': item.endTime,
      'Tanggal': new Date(item.visitDate).toLocaleDateString('id-ID')
    }));
    exportToCSV(csvData, 'kunjungan-lab');
  };

  const handlePrint = () => {
    const printData = filteredKunjungan.map(item => ({
      'Nama Guru': item.teacherName,
      'Kelas Diajar': item.classTeaching,
      'Jam Mulai': item.startTime,
      'Jam Selesai': item.endTime,
      'Tanggal': new Date(item.visitDate).toLocaleDateString('id-ID')
    }));
    printReport('Laporan Kunjungan Lab', printData);
  };

  // Filter kunjungan based on search
  const filteredKunjungan = kunjungan.filter(item =>
    item.teacherName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    item.classTeaching.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Kunjungan Lab"
        description="Kelola data kunjungan lab"
        action={
          <button
            onClick={() => setModalOpen(true)}
            className="px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
          >
            + Tambah Kunjungan
          </button>
        }
      />

      {error && <ErrorMessage message={error} />}

      {/* Search and Export */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <SearchFilter
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Cari nama guru atau kelas..."
          />
          
          {isAdmin && (
            <div className="flex gap-2">
              <button
                onClick={handleExportCSV}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
              >
                📊 Export CSV
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                🖨️ Print
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Kunjungan Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-blue-600">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  No
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Nama Guru
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Kelas Diajar
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Jam Mulai
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Jam Selesai
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Tanggal
                </th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-white uppercase tracking-wider">
                  Aksi
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredKunjungan.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                    {searchTerm ? 'Tidak ada data yang sesuai dengan pencarian' : 'Belum ada data kunjungan'}
                  </td>
                </tr>
              ) : (
                filteredKunjungan.map((item, index) => (
                  <tr key={item.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {index + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {item.teacherName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {item.classTeaching}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-md">
                        {item.startTime}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded-md">
                        {item.endTime}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {new Date(item.visitDate).toLocaleDateString('id-ID')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <div className="flex gap-2">
                        {(user.id === item.userId || isAdmin) && (
                          <button
                            onClick={() => handleEdit(item)}
                            className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 transition-colors"
                          >
                            Edit
                          </button>
                        )}
                        {isAdmin && (
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                          >
                            Hapus
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {modalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="bg-gradient-to-r from-purple-600 to-blue-600 px-6 py-4 rounded-t-xl">
              <h3 className="text-xl font-bold text-white">
                {editData ? 'Edit Kunjungan' : 'Tambah Kunjungan'}
              </h3>
            </div>
            
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Guru <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.teacherName}
                  onChange={(e) => setForm({ ...form, teacherName: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Masukkan nama guru"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas Diajar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={form.classTeaching}
                  onChange={(e) => setForm({ ...form, classTeaching: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                  placeholder="Contoh: XII TKJ 1"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Mulai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.startTime}
                  onChange={(e) => setForm({ ...form, startTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jam Selesai <span className="text-red-500">*</span>
                </label>
                <input
                  type="time"
                  value={form.endTime}
                  onChange={(e) => setForm({ ...form, endTime: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  value={form.visitDate}
                  onChange={(e) => setForm({ ...form, visitDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  required
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  {editData ? 'Perbarui' : 'Simpan'}
                </button>
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-2 bg-gray-300 text-gray-700 rounded-lg hover:bg-gray-400 transition-colors"
                >
                  Batal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
