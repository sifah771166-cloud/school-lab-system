import { NavLink } from 'react-router-dom';
import { clsx } from 'clsx';
import useAuth from '../../hooks/useAuth';

// Navigation items berdasarkan role
const getNavigationByRole = (role) => {
  // Menu untuk USER - hanya Dashboard, Kunjungan, Peminjaman
  if (role === 'USER') {
    return [
      { name: 'Dashboard', href: '/', icon: '📊' },
      { name: 'Kunjungan', href: '/kunjungan', icon: '👥' },
      { name: 'Peminjaman', href: '/loans', icon: '📋' },
    ];
  }

  // Menu untuk ADMIN_JURUSAN - USER menu + management features
  if (role === 'ADMIN_JURUSAN') {
    return [
      { name: 'Dashboard', href: '/', icon: '📊' },
      { name: 'Kunjungan', href: '/kunjungan', icon: '👥' },
      { name: 'Peminjaman', href: '/loans', icon: '📋' },
      { name: 'Labs', href: '/labs', icon: '🧪' },
      { name: 'Items', href: '/items', icon: '📦' },
      { name: 'Schedules', href: '/schedules', icon: '📅' },
    ];
  }

  // Menu untuk SUPER_ADMIN - semua menu
  if (role === 'SUPER_ADMIN') {
    return [
      { name: 'Dashboard', href: '/', icon: '📊' },
      { name: 'Kunjungan', href: '/kunjungan', icon: '👥' },
      { name: 'Peminjaman', href: '/loans', icon: '📋' },
      { name: 'Departments', href: '/departments', icon: '🏫' },
      { name: 'Labs', href: '/labs', icon: '🧪' },
      { name: 'Items', href: '/items', icon: '📦' },
      { name: 'Schedules', href: '/schedules', icon: '📅' },
    ];
  }

  // Default fallback untuk USER
  return [
    { name: 'Dashboard', href: '/', icon: '📊' },
    { name: 'Kunjungan', href: '/kunjungan', icon: '👥' },
    { name: 'Peminjaman', href: '/loans', icon: '📋' },
  ];
};

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const navigation = getNavigationByRole(user?.role || 'USER');

  return (
    <>
      {/* Backdrop overlay - hanya muncul di mobile saat sidebar open */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={clsx(
          'fixed inset-y-0 left-0 z-50 w-64 bg-gray-900 text-white transform transition-transform duration-300 ease-in-out',
          open ? 'translate-x-0' : '-translate-x-full',
          'lg:translate-x-0 lg:static lg:z-auto'
        )}
      >
        <div className="flex items-center justify-center h-16 border-b border-gray-700">
          <h1 className="text-xl font-bold">LabManager</h1>
        </div>
        <nav className="mt-5 px-4 space-y-2">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => onClose && onClose()}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-gray-700 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'
                )
              }
            >
              <span className="mr-3">{item.icon}</span>
              {item.name}
            </NavLink>
          ))}
        </nav>
      </aside>
    </>
  );
}
