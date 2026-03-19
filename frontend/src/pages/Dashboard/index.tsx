import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Link from '@mui/material/Link';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Inventory2Icon from '@mui/icons-material/Inventory2';
import GroupIcon from '@mui/icons-material/Group';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import TollIcon from '@mui/icons-material/Toll';
import { adminApi } from '../../services/admin';
import type { OrderResponse } from '../../types/api';

interface MetricData {
  value: string;
  change: string;
  changeColor: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: '待发货', color: '#1E40AF', bg: '#DBEAFE' },
  PROCESSING: { label: '处理中', color: '#92400E', bg: '#FEF3C7' },
  COMPLETED: { label: '已完成', color: '#166534', bg: '#DCFCE7' },
  CANCELLED: { label: '已取消', color: '#64748B', bg: '#F1F5F9' },
};

export default function Dashboard() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<Record<string, MetricData>>({
    totalProducts: { value: '-', change: '', changeColor: '#64748B' },
    totalUsers: { value: '-', change: '', changeColor: '#64748B' },
    monthlyRedemptions: { value: '-', change: '', changeColor: '#64748B' },
    pointsCirculation: { value: '-', change: '', changeColor: '#64748B' },
  });
  const [recentOrders, setRecentOrders] = useState<OrderResponse[]>([]);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      adminApi.getProductStats(),
      adminApi.getUserStats(),
      adminApi.getOrderStats(),
      adminApi.getPointsStats(),
      adminApi.getOrders({ page: 1, size: 5 }),
    ]).then(([prodRes, userRes, orderRes, pointsRes, ordersRes]) => {
      const p = prodRes.data;
      const u = userRes.data;
      const o = orderRes.data;
      const pts = pointsRes.data;
      const diff = o.monthOrders - o.lastMonthOrders;
      setMetrics({
        totalProducts: { value: String(p.total), change: `+${p.monthNew} 本月新增`, changeColor: '#16A34A' },
        totalUsers: { value: String(u.total), change: `+${u.monthNew} 本月新增`, changeColor: '#16A34A' },
        monthlyRedemptions: {
          value: String(o.monthOrders),
          change: `${diff >= 0 ? '+' : ''}${diff} 较上月`,
          changeColor: diff >= 0 ? '#D97706' : '#DC2626',
        },
        pointsCirculation: {
          value: pts.monthDistributed.toLocaleString(),
          change: '本月发放总量',
          changeColor: '#64748B',
        },
      });
      setRecentOrders(ordersRes.data.records || []);
    }).catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const METRIC_CONFIG = [
    { key: 'totalProducts', icon: Inventory2Icon, iconColor: '#2563EB', iconBg: '#EFF6FF' },
    { key: 'totalUsers', icon: GroupIcon, iconColor: '#16A34A', iconBg: '#DCFCE7' },
    { key: 'monthlyRedemptions', icon: ShoppingCartIcon, iconColor: '#D97706', iconBg: '#FEF3C7' },
    { key: 'pointsCirculation', icon: TollIcon, iconColor: '#7C3AED', iconBg: '#EDE9FE' },
  ];

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', py: 8 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '24px', p: '32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
        {t('admin.dashboard')}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
        {METRIC_CONFIG.map((cfg) => {
          const IconComp = cfg.icon;
          const data = metrics[cfg.key];
          return (
            <Paper key={cfg.key} elevation={0} sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, p: 2.5, borderRadius: 3, border: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{t(`admin.metrics.${cfg.key}`)}</Typography>
                <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: cfg.iconBg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <IconComp sx={{ fontSize: 20, color: cfg.iconColor }} />
                </Box>
              </Box>
              <Typography sx={{ fontSize: 28, fontWeight: 700, color: 'text.primary' }}>{data.value}</Typography>
              <Typography sx={{ fontSize: 12, color: data.changeColor }}>{data.change}</Typography>
            </Paper>
          );
        })}
      </Box>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 2.5, py: 2, borderBottom: '1px solid #F1F5F9' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, color: 'text.primary' }}>{t('admin.recentOrders')}</Typography>
          <Link component="button" underline="none" sx={{ fontSize: 13, color: 'primary.main' }} onClick={() => navigate('/admin/orders')}>
            {t('admin.viewAll')} →
          </Link>
        </Box>
        <TableContainer>
          <Table sx={{ '& .MuiTableCell-root': { borderColor: '#F1F5F9' } }}>
            <TableHead>
              <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>用户</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>{t('admin.table.product')}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 80, py: '10px', px: '20px' }}>{t('admin.table.points')}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 90, py: '10px', px: '20px' }}>{t('admin.table.status')}</TableCell>
                <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 160, py: '10px', px: '20px' }}>{t('admin.table.time')}</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {recentOrders.map((order) => {
                const statusCfg = STATUS_CONFIG[order.status] || { label: order.status, color: '#64748B', bg: '#F1F5F9' };
                return (
                  <TableRow key={order.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                    <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>{order.username || `用户${order.userId}`}</TableCell>
                    <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>{order.productName}</TableCell>
                    <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>{order.pointsCost}</TableCell>
                    <TableCell sx={{ py: '12px', px: '20px' }}>
                      <Chip label={statusCfg.label} size="small" sx={{ fontSize: 11, fontWeight: 500, color: statusCfg.color, bgcolor: statusCfg.bg, borderRadius: '12px', height: 24 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 13, color: 'text.secondary', py: '12px', px: '20px' }}>{order.createdAt}</TableCell>
                  </TableRow>
                );
              })}
              {recentOrders.length === 0 && (
                <TableRow><TableCell colSpan={5} sx={{ textAlign: 'center', py: 4, color: 'text.secondary' }}>暂无兑换记录</TableCell></TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Box>
  );
}
