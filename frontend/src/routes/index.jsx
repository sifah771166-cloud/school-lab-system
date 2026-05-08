import { createBrowserRouter, Navigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import ProtectedRoute from '../components/ProtectedRoute';
import RoleProtectedRoute from '../components/RoleProtectedRoute';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Dashboard from '../pages/Dashboard';
import NotFound from '../pages/NotFound';
import Departments from '../pages/Departments';
import Labs from '../pages/Labs';
import Schedules from '../pages/Schedules';
import Kunjungan from '../pages/Kunjungan';
import Items from '../pages/Items';
import Loans from '../pages/Loans';

const router = createBrowserRouter([
  {
    path: '/login',
    element: <Login />,
  },
  {
    path: '/register',
    element: <Register />,
  },
  {
    // Protected routes wrapper
    element: <ProtectedRoute />,
    children: [
      {
        path: '/',
        element: <DashboardLayout />,
        children: [
          {
            index: true,
            element: <Dashboard />,
          },
          // USER accessible routes
          {
            path: 'kunjungan',
            element: <Kunjungan />,
          },
          {
            path: 'loans',
            element: <Loans />,
          },
          // ADMIN_JURUSAN and SUPER_ADMIN only routes
          {
            element: <RoleProtectedRoute allowedRoles={['ADMIN_JURUSAN', 'SUPER_ADMIN']} />,
            children: [
              {
                path: 'labs',
                element: <Labs />,
              },
              {
                path: 'schedules',
                element: <Schedules />,
              },
              {
                path: 'items',
                element: <Items />,
              },
            ],
          },
          // SUPER_ADMIN only routes
          {
            element: <RoleProtectedRoute allowedRoles={['SUPER_ADMIN']} />,
            children: [
              {
                path: 'departments',
                element: <Departments />,
              },
            ],
          },
        ],
      },
    ],
  },
  {
    path: '*',
    element: <NotFound />,
  },
]);

export default router;