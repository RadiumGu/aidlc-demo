import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login';
import NotFound from '../pages/NotFound';
import EmployeeLayout from '../components/Layout/EmployeeLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import ShopHome from '../pages/ShopHome';
import Orders from '../pages/Orders';
import PointsHistory from '../pages/PointsHistory';
import Dashboard from '../pages/Dashboard';
import AdminProducts from '../pages/admin/Products';
import AdminOrders from '../pages/admin/Orders';
import AdminPoints from '../pages/admin/Points';
import AdminCategories from '../pages/admin/Categories';
import AdminUsers from '../pages/admin/Users';
import AuthGuard from './AuthGuard';

const router = createBrowserRouter(
  [
    {
      path: '/login',
      element: <Login />,
    },
    // Employee routes
    {
      path: '/',
      element: (
        <AuthGuard requiredRole="employee">
          <EmployeeLayout />
        </AuthGuard>
      ),
      children: [
        { index: true, element: <ShopHome /> },
        { path: 'orders', element: <Orders /> },
        { path: 'points', element: <PointsHistory /> },
      ],
    },
    // Admin routes
    {
      path: '/admin',
      element: (
        <AuthGuard requiredRole="admin">
          <AdminLayout />
        </AuthGuard>
      ),
      children: [
        { index: true, element: <Dashboard /> },
        { path: 'products', element: <AdminProducts /> },
        { path: 'orders', element: <AdminOrders /> },
        { path: 'points', element: <AdminPoints /> },
        { path: 'categories', element: <AdminCategories /> },
        { path: 'users', element: <AdminUsers /> },
      ],
    },
    {
      path: '*',
      element: <NotFound />,
    },
  ],
  {
    basename: '/shop',
  },
);

export default router;
