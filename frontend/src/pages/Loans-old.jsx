import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import PageHeader from '../components/ui/PageHeader';

export default function Loans() {
  const { user } = useAuth();
  const [loans, setLoans] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [showRequestForm, setShowRequestForm] = useState(false);
  const [requestForm, setRequestForm] = useState({
    borrowerName: '',
    borrowerClass: '',
    itemId: '',
    quantity: 1,
    requestNote: '',
    dueDate: '',
  });

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_JURUSAN';
  const isUser = user?.role === 'USER';

  useEffect(() => {
    fetchLoans();
    fetchItems();
  }, []);

  const fetchLoans = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/loans/all' : '/loans/my';
      const { data } = await api.get(endpoint);
      setLoans(data.data || data.loans || []);
      setError('');
    } catch (err) {
      setError('Gagal memuat data peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/items');
      setItems(data.data || []);
    } catch (err) {
      console.error('Failed to fetch items');
    }
  };

  const handleRequest = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await api.post('/loans', requestForm);
      setMessage('✅ Permintaan peminjaman berhasil diajukan!');
      setShowRequestForm(false);
      setRequestForm({
        borrowerName: '',
        borrowerClass: '',
        itemId: '',
        quantity: 1,
        requestNote: '',
        dueDate: '',
      });
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengajukan peminjaman');
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (id) => {
    if (!window.confirm('Setujui peminjaman ini?')) return;
    try {
      await api.put(`/loans/${id}/approve`, { status: 'approved' });
      setMessage('✅ Peminjaman disetujui');
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menyetujui');
    }
  };

  const handleReject = async (id) => {
    const reason = prompt('Alasan penolakan (opsional):');
    try {
      await api.put(`/loans/${id}/approve`, { status: 'rejected', rejectionReason: reason });
      setMessage('Peminjaman ditolak');
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal menolak');
    }
  };

  const handleReturn = async (id) => {
    if (!window.confirm('Tandai barang sudah dikembalikan?')) return;
    try {
      await api.put(`/loans/${id}/return`);
      setMessage('✅ Barang berhasil dikembalikan');
      fetchLoans();
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal mengembalikan');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: { label: 'Menunggu', color: 'bg-yellow-100 text-yellow-800' },
      approved: { label: 'Disetujui', color: 'bg-green-100 text-green-800' },
      rejected: { label: 'Ditolak', color: 'bg-red-100 text-red-800' },
      returned: { label: 'Dikembalikan', color: 'bg-gray-100 text-gray-800' },
    };
    const s = statusMap[status] || { label: status, color: 'bg-gray-100' };
    return (
      <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${s.color}`}>
        {s.label}
      </span>
    );
  };

  const getReturnStatus = (loan) => {
    if (loan.status === 'returned') {
      return <span className="text-green-600 font-medium">✓ Sudah Dikembalikan</span>;
    }
    if (loan.status === 'approved') {
      return <span className="text-orange-600 font-medium">⏳ Belum Dikembalikan</span>;
    }
    return <span className="text-gray-500">-</span>;
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  return (
    <div>
      <PageHeader
        title={isUser ? "Peminjaman Barang" : "Loans Management"}
        description={isUser ? "Ajukan peminjaman barang laboratorium" : "Manage equipment loans"}
      />

      {error && <ErrorMessage message={error} />}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md mb-4">
          {message}
        </div>
      )}

      {/* Request Button */}
      {!isAdmin && (
        <div className="mb-6">
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 font-medium"
          >
            {showRequestForm ? 'Tutup Form' : '+ Ajukan Peminjaman'}
          </button>
        </div>
      )}

      {/* Request Form (USER) */}
      {showRequestForm && !isAdmin && (
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Form Peminjaman Barang</h2>
          <form onSubmit={handleRequest} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Peminjam *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.borrowerName}
                  onChange={(e) => setRequestForm({ ...requestForm, borrowerName: e.target.value })}
                  placeholder="Masukkan nama peminjam"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Kelas Peminjam *
                </label>
                <input
                  type="text"
                  required
                  value={requestForm.borrowerClass}
                  onChange={(e) => setRequestForm({ ...requestForm, borrowerClass: e.target.value })}
                  placeholder="Contoh: XII RPL 1"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Pilih Barang *
                </label>
                <select
                  required
                  value={requestForm.itemId}
                  onChange={(e) => setRequestForm({ ...requestForm, itemId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">-- Pilih Barang --</option>
                  {items.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name} (Stok: {item.quantity})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Jumlah *
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={requestForm.quantity}
                  onChange={(e) => setRequestForm({ ...requestForm, quantity: +e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Peminjaman *
                </label>
                <input
                  type="date"
                  required
                  value={requestForm.dueDate}
                  onChange={(e) => setRequestForm({ ...requestForm, dueDate: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <textarea
                  value={requestForm.requestNote}
                  onChange={(e) => setRequestForm({ ...requestForm, requestNote: e.target.value })}
                  placeholder="Keperluan peminjaman..."
                  rows="3"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Ajukan Peminjaman'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loans Table */}
      <div className="bg-white shadow rounded-lg overflow-hidden">
        {loading ? (
          <div className="p-6">
            <LoadingSpinner />
          </div>
        ) : loans.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {isUser ? 'Belum ada riwayat peminjaman' : 'No loan records found'}
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {isUser ? 'Nama Peminjam' : 'Borrower'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {isUser ? 'Kelas' : 'Class'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {isUser ? 'Barang' : 'Item'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {isUser ? 'Tanggal' : 'Date'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  {isUser ? 'Status Pengembalian' : 'Return Status'}
                </th>
                {isAdmin && (
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {loans.map((loan) => (
                <tr key={loan.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {loan.borrowerName || loan.user?.name || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.borrowerClass || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{loan.item?.name || '-'}</div>
                    <div className="text-xs text-gray-500">Qty: {loan.quantity}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(loan.dueDate || loan.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {isUser ? getReturnStatus(loan) : getStatusBadge(loan.status)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {loan.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(loan.id)}
                            className="text-green-600 hover:text-green-900"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(loan.id)}
                            className="text-red-600 hover:text-red-900"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {loan.status === 'approved' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="text-indigo-600 hover:text-indigo-900"
                        >
                          Mark Returned
                        </button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}