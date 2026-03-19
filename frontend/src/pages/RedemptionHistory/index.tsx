import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import InputBase from '@mui/material/InputBase';
import Pagination from '@mui/material/Pagination';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import ImageIcon from '@mui/icons-material/Image';
import { useOrderStore } from '../../store/useOrderStore';
import type { OrderResponse } from '../../types/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: '待发货', color: '#166534', bg: '#DCFCE7' },
  READY: { label: '已发货', color: '#1E40AF', bg: '#DBEAFE' },
  COMPLETED: { label: '已完成', color: '#64748B', bg: '#F1F5F9' },
  CANCELLED: { label: '已取消', color: '#991B1B', bg: '#FEE2E2' },
};

export default function RedemptionHistory() {
  const navigate = useNavigate();
  const { orders, total, loading, fetchOrders } = useOrderStore();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const pageSize = 10;

  useEffect(() => { fetchOrders({ page, size: pageSize }); }, [fetchOrders, page]);

  const tabs = ['全部', '待发货', '已发货', '已完成', '已取消'];
  const statusMap: Record<number, string> = { 1: 'PENDING', 2: 'READY', 3: 'COMPLETED', 4: 'CANCELLED' };
  const filtered = tab === 0 ? orders : orders.filter((o) => o.status === statusMap[tab]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: 960, display: 'flex', flexDirection: 'column', gap: 3, height: '100%' }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>兑换记录</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.secondary', mt: 1 }}>查看您的所有积分兑换订单</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', width: 280, height: 40, border: '1px solid', borderColor: 'divider', borderRadius: 2, px: 1.5, gap: 1 }}>
            <SearchIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
            <InputBase placeholder="搜索订单编号或商品名称" value={search} onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: 1, fontSize: 13 }} />
          </Box>
        </Box>

        {/* Filter Tabs - pill style */}
        <Paper elevation={0} sx={{ display: 'flex', alignItems: 'center', borderRadius: 2, border: '1px solid #F1F5F9', p: 0.5 }}>
          {tabs.map((t, i) => (
            <Box key={t} onClick={() => setTab(i)}
              sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: 2, cursor: 'pointer',
                bgcolor: tab === i ? '#2563EB' : 'transparent', color: tab === i ? '#fff' : 'text.secondary',
                fontSize: 13, fontWeight: tab === i ? 600 : 500, transition: 'all 0.2s' }}>
              <Typography sx={{ fontSize: 13, fontWeight: tab === i ? 600 : 500, color: 'inherit' }}>{t}</Typography>
            </Box>
          ))}
        </Paper>

        {/* Order List */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {filtered.map((order: OrderResponse) => {
              const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#64748B', bg: '#F1F5F9' };
              const isCancelled = order.status === 'CANCELLED';
              return (
                <Paper key={order.id} elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', overflow: 'hidden' }}>
                  {/* Card Header */}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: '20px', py: '16px', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Typography sx={{ fontSize: 13, fontWeight: 500, color: 'text.secondary' }}>订单号：{order.id}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>{order.createdAt}</Typography>
                    </Box>
                    <Chip label={statusCfg.label} size="small" sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontSize: 12, fontWeight: 600, borderRadius: '12px', height: 24 }} />
                  </Box>
                  {/* Card Body */}
                  <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '16px', gap: 2, opacity: isCancelled ? 0.5 : 1 }}>
                    {order.productImageUrl ? (
                      <CardMedia component="img" image={order.productImageUrl} sx={{ width: 64, height: 64, borderRadius: 2, objectFit: 'cover' }} />
                    ) : (
                      <Box sx={{ width: 64, height: 64, bgcolor: '#F1F5F9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <ImageIcon sx={{ fontSize: 32, color: '#CBD5E1' }} />
                      </Box>
                    )}
                    <Box sx={{ flex: 1 }}>
                      <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{order.productName}</Typography>
                      <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>x1</Typography>
                    </Box>
                    <Box sx={{ textAlign: 'right' }}>
                      <Typography sx={{ fontSize: 16, fontWeight: 700, color: isCancelled ? 'text.disabled' : '#2563EB' }}>{order.pointsCost.toLocaleString()} 积分</Typography>
                      {isCancelled && <Typography sx={{ fontSize: 12, color: '#16A34A' }}>积分已退还</Typography>}
                    </Box>
                  </Box>
                  {/* Card Footer */}
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', gap: '10px', px: '20px', py: '12px', borderTop: '1px solid', borderColor: 'divider' }}>
                    <Button size="small" variant="outlined" onClick={() => navigate(`/orders/${order.id}`)}
                      sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 500, px: 2, py: 0.75 }}>查看详情</Button>
                    {(order.status === 'COMPLETED' || order.status === 'CANCELLED') && (
                      <Button size="small" variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, px: 2, py: 0.75 }}>再次兑换</Button>
                    )}
                    {order.status === 'PENDING' && (
                      <Button size="small" variant="contained" sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, px: 2, py: 0.75 }}>确认收货</Button>
                    )}
                    {order.status === 'READY' && (
                      <Button size="small" variant="contained" color="success" sx={{ borderRadius: 2, textTransform: 'none', fontSize: 12, fontWeight: 600, px: 2, py: 0.75 }}>确认收货</Button>
                    )}
                  </Box>
                </Paper>
              );
            })}
            {filtered.length === 0 && <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>暂无记录</Typography>}
          </Box>
        )}

        {totalPages > 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
          </Box>
        )}
      </Box>
    </Box>
  );
}
