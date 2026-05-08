import React from 'react';

export default function StatusBadge({ status, type = 'loan' }) {
  const statusConfig = {
    loan: {
      pending: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
      approved: { bg: 'bg-green-100', text: 'text-green-700', label: 'Approved' },
      rejected: { bg: 'bg-red-100', text: 'text-red-700', label: 'Rejected' },
      returned: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Returned' },
      DIPINJAM: { bg: 'bg-orange-100', text: 'text-orange-700', label: 'Dipinjam' },
      KEMBALI: { bg: 'bg-green-100', text: 'text-green-700', label: 'Kembali' },
      PENDING: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Pending' },
    },
    attendance: {
      active: { bg: 'bg-green-100', text: 'text-green-700', label: 'Active' },
      completed: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Completed' },
      HADIR: { bg: 'bg-blue-100', text: 'text-blue-700', label: 'Hadir' },
      TIDAK_HADIR: { bg: 'bg-gray-100', text: 'text-gray-700', label: 'Tidak Hadir' },
    },
    stock: {
      LOW: { bg: 'bg-red-100', text: 'text-red-700', label: 'Stok Rendah' },
      MEDIUM: { bg: 'bg-yellow-100', text: 'text-yellow-700', label: 'Stok Sedang' },
      HIGH: { bg: 'bg-green-100', text: 'text-green-700', label: 'Stok Cukup' },
    },
  };

  const config = statusConfig[type]?.[status] || { 
    bg: 'bg-gray-100', 
    text: 'text-gray-700', 
    label: status 
  };

  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${config.bg} ${config.text} uppercase tracking-wide`}>
      {config.label}
    </span>
  );
}
