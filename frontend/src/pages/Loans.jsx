import { useState, useEffect } from 'react';
import api from '../config/axios';
import useAuth from '../hooks/useAuth';
import LoadingSpinner from '../components/ui/LoadingSpinner';
import ErrorMessage from '../components/ui/ErrorMessage';
import PageHeader from '../components/ui/PageHeader';
import SearchFilter from '../components/ui/SearchFilter';
import StatusBadge from '../components/ui/StatusBadge';
import { exportToCSV, printReport } from '../utils/export';

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

  // Search and filter
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const isAdmin = user?.role === 'SUPER_ADMIN' || user?.role === 'ADMIN_JURUSAN';
  const isUser = user?.role === 'USER';

  // Filtered loans
  const filteredLoans = loans.filter(loan => {
    const matchesSearch = 
      loan.borrowerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.borrowerClass?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      loan.item?.name?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = !filterStatus || loan.status === filterStatus;
    return matchesSearch && matchesStatus;
  });

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

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('id-ID', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleExport = () => {
    const exportData = filteredLoans.map(loan => ({
      'Borrower Name': loan.borrowerName,
      'Class': loan.borrowerClass,
      'Item': loan.item?.name || '-',
      'Quantity': loan.quantity,
      'Status': loan.status,
      'Request Date': formatDate(loan.createdAt),
      'Due Date': formatDate(loan.dueDate),
      'Return Date': formatDate(loan.returnDate)
    }));
    exportToCSV(exportData, 'loans-data');
  };

  const handlePrint = () => {
    const headers = ['Borrower', 'Class', 'Item', 'Qty', 'Status', 'Request Date', 'Due Date'];
    const rows = filteredLoans.map(loan => [
      loan.borrowerName,
      loan.borrowerClass,
      loan.item?.name || '-',
      loan.quantity,
      loan.status,
      formatDate(loan.createdAt),
      formatDate(loan.dueDate)
    ]);
    printReport('Loans Report', headers, rows);
  };

  if (loading && loans.length === 0) return <LoadingSpinner />;

  return (
    <div className="space-y-6">
      <PageHeader
        title={isUser ? "Peminjaman Barang" : "Loans Management"}
        description={isUser ? "Ajukan peminjaman barang laboratorium" : "Manage equipment loans"}
        action={
          isAdmin && (
            <div className="flex space-x-2">
              <button onClick={handleExport} className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 flex items-center">
                <span className="mr-2">📥</span> Export CSV
              </button>
              <button onClick={handlePrint} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center">
                <span className="mr-2">🖨️</span> Print
              </button>
            </div>
          )
        }
      />

      {error && <ErrorMessage message={error} />}
      {message && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-md">
          {message}
        </div>
      )}

      {/* Request Button */}
      {!isAdmin && (
        <div>
          <button
            onClick={() => setShowRequestForm(!showRequestForm)}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 font-medium shadow-md"
          >
            {showRequestForm ? '✕ Tutup Form' : '+ Ajukan Peminjaman'}
          </button>
        </div>
      )}

      {/* Request Form (USER) */}
      {showRequestForm && !isAdmin && (
        <div className="bg-white shadow-lg rounded-xl p-6 border border-purple-100">
          <h2 className="text-xl font-semibold text-gray-900 mb-6 flex items-center">
            <span className="text-2xl mr-2">📋</span>
            Form Peminjaman Barang
          </h2>
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
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
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal Jatuh Tempo *
                </label>
                <input
                  type="date"
                  required
                  value={requestForm.dueDate}
                  onChange={(e) => setRequestForm({ ...requestForm, dueDate: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan (Opsional)
                </label>
                <input
                  type="text"
                  value={requestForm.requestNote}
                  onChange={(e) => setRequestForm({ ...requestForm, requestNote: e.target.value })}
                  placeholder="Catatan tambahan"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowRequestForm(false)}
                className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50"
              >
                Batal
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 disabled:opacity-50"
              >
                {loading ? 'Mengirim...' : 'Ajukan Peminjaman'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search and Filter */}
      <SearchFilter
        searchValue={searchTerm}
        onSearchChange={(e) => setSearchTerm(e.target.value)}
        searchPlaceholder="Search by borrower name, class, or item..."
        filterValue={filterStatus}
        onFilterChange={(e) => setFilterStatus(e.target.value)}
        filterOptions={[
          { value: '', label: 'All Status' },
          { value: 'pending', label: 'Pending' },
          { value: 'approved', label: 'Approved' },
          { value: 'rejected', label: 'Rejected' },
          { value: 'returned', label: 'Returned' }
        ]}
        filterPlaceholder="Filter by status"
      />

      {/* Loans Table */}
      <div className="bg-white shadow-md rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gradient-to-r from-purple-600 to-indigo-600 text-white">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Borrower</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Class</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Item</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Request Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase">Due Date</th>
                {isAdmin && <th className="px-6 py-3 text-right text-xs font-medium uppercase">Actions</th>}
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredLoans.map((loan) => (
                <tr key={loan.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {loan.borrowerName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.borrowerClass}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.item?.name || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {loan.quantity}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <StatusBadge status={loan.status} type="loan" />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(loan.createdAt)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatDate(loan.dueDate)}
                  </td>
                  {isAdmin && (
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                      {loan.status === 'pending' && (
                        <>
                          <button
                            onClick={() => handleApprove(loan.id)}
                            className="text-green-600 hover:text-green-900 font-semibold"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleReject(loan.id)}
                            className="text-red-600 hover:text-red-900 font-semibold"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      {loan.status === 'approved' && (
                        <button
                          onClick={() => handleReturn(loan.id)}
                          className="text-blue-600 hover:text-blue-900 font-semibold"
                        >
                          Mark Returned
                        </button>
                      )}
                      {(loan.status === 'rejected' || loan.status === 'returned') && (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
              {filteredLoans.length === 0 && (
                <tr>
                  <td colSpan={isAdmin ? 8 : 7} className="px-6 py-8 text-center text-sm text-gray-500">
                    {searchTerm || filterStatus ? 'No loans match your search criteria.' : 'No loans found.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
