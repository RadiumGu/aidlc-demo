import { createBrowserRouter } from 'react-router';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';
import EmployeeLayout from '../components/Layout/EmployeeLayout';
import AdminLayout from '../components/Layout/AdminLayout';
import ShopHome from '../pages/ShopHome';
import ProductDetail from '../pages/ProductDetail';
import ConfirmRedemption from '../pages/ConfirmRedemption';
import OrderDetail from '../pages/OrderDetail';
import RedemptionHistory from '../pages/RedemptionHistory';
import PointsCenter from '../pages/PointsCenter';
import Dashboard from '../pages/Dashboard';
import ProductManagement from '../pages/admin/ProductManagement';
import AdminProductDetail from '../pages/admin/AdminProductDetail';
import EditProduct from '../pages/admin/EditProduct';
import NewProduct from '../pages/admin/NewProduct';
import CategoryManagement from '../pages/admin/CategoryManagement';
import PointsManagement from '../pages/admin/PointsRuleManagement';
import PointsConfig from '../pages/admin/PointsConfig';
import ExchangeRecords from '../pages/admin/ExchangeRecords';
import ExchangeDetail from '../pages/admin/ExchangeDetail';
import UserManagement from '../pages/admin/UserManagement';
import UserPointsHistory from '../pages/admin/UserPointsHistory';
import AuthGuard from './AuthGuard';

const router = createBrowserRouter([
  { path: '/login', element: <Login /> },
  { path: '/register', element: <Register /> },
  // Employee routes
  {
    path: '/',
    element: (
      <AuthGuard requiredRole="EMPLOYEE">
        <EmployeeLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <ShopHome /> },
      { path: 'product/:id', element: <ProductDetail /> },
      { path: 'confirm-redemption', element: <ConfirmRedemption /> },
      { path: 'orders', element: <RedemptionHistory /> },
      { path: 'orders/:id', element: <OrderDetail /> },
      { path: 'points', element: <PointsCenter /> },
    ],
  },
  // Admin routes
  {
    path: '/admin',
    element: (
      <AuthGuard requiredRole="ADMIN">
        <AdminLayout />
      </AuthGuard>
    ),
    children: [
      { index: true, element: <Dashboard /> },
      { path: 'products', element: <ProductManagement /> },
      { path: 'products/new', element: <NewProduct /> },
      { path: 'products/:id', element: <AdminProductDetail /> },
      { path: 'products/:id/edit', element: <EditProduct /> },
      { path: 'categories', element: <CategoryManagement /> },
      { path: 'points', element: <PointsManagement /> },
      { path: 'points/config', element: <PointsConfig /> },
      { path: 'orders', element: <ExchangeRecords /> },
      { path: 'orders/:id', element: <ExchangeDetail /> },
      { path: 'users', element: <UserManagement /> },
      { path: 'users/:id/points', element: <UserPointsHistory /> },
    ],
  },
  { path: '*', element: <NotFound /> },
]);

export default router;
