import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import SearchIcon from '@mui/icons-material/Search';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import { adminApi } from '../../../services/admin';
import type { OrderResponse } from '../../../types/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: '待发货', color: '#D97706', bg: '#FFF7ED' },
  READY: { label: '已发货', color: '#1E40AF', bg: '#DBEAFE' },
  COMPLETED: { label: '已完成', color: '#166534', bg: '#DCFCE7' },
  CANCELLED: { label: '已取消', color: '#991B1B', bg: '#FEE2E2' },
};

export default function ExchangeRecords() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<OrderResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [, setStats] = useState<{ monthOrders: number; lastMonthOrders: number } | null>(null);
  const pageSize = 10;

  const fetchData = () => {
    setLoading(true);
    adminApi.getOrders({ page, size: pageSize, keyword: keyword || undefined })
      .then((r) => { setOrders(r.data.records); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, [page]);
  useEffect(() => { adminApi.getOrderStats().then((r) => setStats(r.data)); }, []);

  const totalPages = Math.ceil(total / pageSize);
  const filtered = statusFilter === 'ALL' ? orders : orders.filter((o) => o.status === statusFilter);
  const pendingCount = orders.filter((o) => o.status === 'PENDING').length;
  const completedCount = orders.filter((o) => o.status === 'COMPLETED').length;
  const totalPoints = orders.reduce((s, o) => s + o.pointsCost, 0);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '32px' }}>
      <Box>
        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>兑换记录管理</Typography>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>查看和管理员工积分兑换订单</Typography>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[
          { label: '总兑换数', value: total, icon: <ShoppingCartIcon sx={{ fontSize: 18, color: '#2563EB' }} />, bg: '#EFF6FF', color: '#1E40AF' },
          { label: '待发货', value: pendingCount, icon: <LocalShippingIcon sx={{ fontSize: 18, color: '#F59E0B' }} />, bg: '#FFF7ED', color: '#F59E0B' },
          { label: '已完成', value: completedCount, icon: <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />, bg: '#ECFDF5', color: '#10B981' },
          { label: '消耗积分', value: totalPoints.toLocaleString(), icon: <TollIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />, bg: '#F5F3FF', color: '#1E40AF' },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ flex: 1, p: '18px 20px', borderRadius: 3, border: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>{s.label}</Typography>
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField size="small" placeholder="搜索订单号 / 员工姓名" value={keyword} onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> } }}
          sx={{ width: 260, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <Select size="small" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} sx={{ minWidth: 110, borderRadius: 2, fontSize: 13 }}>
          <MenuItem value="ALL">全部状态</MenuItem>
          <MenuItem value="PENDING">待发货</MenuItem>
          <MenuItem value="READY">已发货</MenuItem>
          <MenuItem value="COMPLETED">已完成</MenuItem>
          <MenuItem value="CANCELLED">已取消</MenuItem>
        </Select>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 130 }}>订单编号</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>商品信息</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>兑换员工</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 90 }}>消耗积分</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 110 }}>兑换时间</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 70 }}>状态</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 60 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((order) => {
                  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#64748B', bg: '#F1F5F9' };
                  return (
                    <TableRow key={order.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                      <TableCell><Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2563EB' }}>EX{String(order.id).padStart(6, '0')}</Typography></TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          {order.productImageUrl ? (
                            <Box component="img" src={order.productImageUrl} sx={{ width: 36, height: 36, borderRadius: 1.5, objectFit: 'cover' }} />
                          ) : (
                            <Box sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <ShoppingBagIcon sx={{ fontSize: 18, color: '#2563EB' }} />
                            </Box>
                          )}
                          <Box>
                            <Typography sx={{ fontSize: 12, fontWeight: 600 }}>{order.productName}</Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ fontSize: 12 }}>{order.username || `用户${order.userId}`}</TableCell>
                      <TableCell sx={{ fontSize: 12, fontWeight: 600 }}>{order.pointsCost.toLocaleString()}</TableCell>
                      <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{order.createdAt?.split(' ')[0]}</TableCell>
                      <TableCell><Chip label={statusCfg.label} size="small" sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontSize: 11, height: 24, borderRadius: 3 }} /></TableCell>
                      <TableCell>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2563EB', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => navigate(`/admin/orders/${order.id}`)}>详情</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} 共 {total} 条记录</Typography>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
        </Box>
      )}
    </Box>
  );
}
