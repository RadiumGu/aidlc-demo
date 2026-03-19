import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PrintIcon from '@mui/icons-material/Print';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import CancelIcon from '@mui/icons-material/Cancel';
import { adminApi } from '../../../services/admin';
import type { OrderResponse } from '../../../types/api';

const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: '待发货', color: '#D97706', bg: '#FFF7ED' },
  READY: { label: '已发货', color: '#1E40AF', bg: '#DBEAFE' },
  COMPLETED: { label: '已完成', color: '#16A34A', bg: '#DCFCE7' },
  CANCELLED: { label: '已取消', color: '#DC2626', bg: '#FEE2E2' },
};

const NEXT_STATUS: Record<string, string[]> = {
  PENDING: ['READY', 'CANCELLED'],
  READY: ['COMPLETED', 'CANCELLED'],
};

export default function ExchangeDetail() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const orderId = Number(id);

  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('');
  const [updating, setUpdating] = useState(false);
  const [company, setCompany] = useState('');
  const [tracking, setTracking] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (!orderId) return;
    setLoading(true);
    adminApi.getOrderById(orderId)
      .then((res) => setOrder(res.data))
      .catch(() => setOrder(null))
      .finally(() => setLoading(false));
  }, [orderId]);

  const handleUpdateStatus = async () => {
    if (!newStatus || !order) return;
    setUpdating(true);
    try {
      const res = await adminApi.updateOrderStatus(order.id, { status: newStatus });
      setOrder(res.data);
      setDialogOpen(false);
    } finally {
      setUpdating(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 10 }}><CircularProgress /></Box>;
  if (!order) return <Box sx={{ p: 4 }}><Typography color="error">订单不存在</Typography></Box>;

  const statusInfo = STATUS_MAP[order.status] || { label: order.status, color: '#64748B', bg: '#F1F5F9' };
  const availableNext = NEXT_STATUS[order.status] || [];

  // Build timeline from order data
  const timeline = [
    { label: '订单创建', time: order.createdAt, color: '#2563EB', done: true },
    ...(order.status === 'READY' || order.status === 'COMPLETED' ? [{ label: '已发货', time: order.updatedAt, color: '#D97706', done: true }] : []),
    ...(order.status === 'COMPLETED' ? [{ label: '已完成', time: order.updatedAt, color: '#16A34A', done: true }] : []),
    ...(order.status === 'CANCELLED' ? [{ label: '已取消', time: order.updatedAt, color: '#DC2626', done: true }] : []),
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      {/* Status update dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 440 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LocalShippingIcon sx={{ fontSize: 20, color: '#2563EB' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>修改发货状态</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>EX{String(order.id).padStart(6, '0')}</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setDialogOpen(false)} sx={{ width: 32, height: 32 }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, py: 2.5 }}>
          {/* Current status */}
          <Box sx={{ bgcolor: '#FFF7ED', borderRadius: 2, px: 2, py: 1.5, display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>当前状态</Typography>
            <Chip label={statusInfo.label} size="small" sx={{ bgcolor: '#fff', color: statusInfo.color, fontSize: 12, fontWeight: 600, border: `1px solid ${statusInfo.color}` }} />
            <ArrowForwardIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          </Box>
          {/* Target status */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>目标状态 <Typography component="span" sx={{ color: 'error.main', fontSize: 13 }}>*</Typography></Typography>
            <Select fullWidth size="small" value={newStatus} onChange={(e) => setNewStatus(e.target.value)} sx={{ borderRadius: 2 }}>
              {availableNext.map((s) => { const si = STATUS_MAP[s]; return <MenuItem key={s} value={s}>{si?.label || s}</MenuItem>; })}
            </Select>
          </Box>
          {/* Logistics company */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>快递公司 <Typography component="span" sx={{ color: 'error.main', fontSize: 13 }}>*</Typography></Typography>
            <Select fullWidth size="small" displayEmpty value={company} onChange={(e) => setCompany(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="" disabled><Typography sx={{ color: 'text.disabled', fontSize: 13 }}>请选择</Typography></MenuItem>
              <MenuItem value="顺丰速运">顺丰速运</MenuItem>
              <MenuItem value="中通快递">中通快递</MenuItem>
              <MenuItem value="圆通速递">圆通速递</MenuItem>
              <MenuItem value="韵达快递">韵达快递</MenuItem>
              <MenuItem value="申通快递">申通快递</MenuItem>
              <MenuItem value="京东物流">京东物流</MenuItem>
              <MenuItem value="公司自送">公司自送</MenuItem>
            </Select>
          </Box>
          {/* Tracking number */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>快递单号 <Typography component="span" sx={{ color: 'error.main', fontSize: 13 }}>*</Typography></Typography>
            <TextField fullWidth size="small" placeholder="请输入快递单号" value={tracking} onChange={(e) => setTracking(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
          {/* Note */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>备注说明</Typography>
            <TextField fullWidth size="small" multiline rows={3} placeholder="请输入备注说明" value={note} onChange={(e) => setNote(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', gap: 1.5 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>取消</Button>
          <Button variant="contained" startIcon={<CheckIcon />} disabled={!newStatus || updating} onClick={handleUpdateStatus} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}>确认修改</Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box>
        <Breadcrumbs sx={{ fontSize: 13, mb: 1 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/orders')}>兑换记录</Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>兑换详情</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>订单 #{order.id}</Typography>
            <Chip label={statusInfo.label} sx={{ bgcolor: statusInfo.bg, color: statusInfo.color, fontWeight: 600 }} />
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {order.status !== 'CANCELLED' && order.status !== 'COMPLETED' && (
              <Button size="small" variant="outlined" color="error" startIcon={<CancelIcon />}
                onClick={() => { setNewStatus('CANCELLED'); setCompany(''); setTracking(''); setNote(''); setDialogOpen(true); }}
                sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>取消订单</Button>
            )}
            <Button size="small" variant="outlined" startIcon={<PrintIcon />} onClick={() => window.print()} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>打印详情</Button>
            {availableNext.length > 0 && (
              <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => { setNewStatus(availableNext[0]); setCompany(''); setTracking(''); setNote(''); setDialogOpen(true); }} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>修改状态</Button>
            )}
          </Box>
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left Column */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Product Info */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>商品信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {order.productImageUrl ? (
                <Box component="img" src={order.productImageUrl} sx={{ width: 72, height: 72, borderRadius: 3, objectFit: 'cover' }} />
              ) : (
                <Box sx={{ width: 72, height: 72, bgcolor: '#DBEAFE', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ShoppingBagIcon sx={{ fontSize: 36, color: '#2563EB' }} />
                </Box>
              )}
              <Box sx={{ flex: 1 }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{order.productName}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.disabled', mt: 0.5 }}>商品编号：PRD{String(order.productId).padStart(6, '0')}</Typography>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>{order.pointsCost.toLocaleString()}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>积分</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Points Breakdown */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>积分明细</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>商品积分</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{order.pointsCost.toLocaleString()}</Typography>
              </Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>运费积分</Typography>
                <Typography sx={{ fontSize: 13, fontWeight: 500 }}>0</Typography>
              </Box>
              <Divider />
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600 }}>合计消耗</Typography>
                <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2563EB' }}>{order.pointsCost.toLocaleString()} 积分</Typography>
              </Box>
            </Box>
          </Paper>

          {/* Employee Info */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>兑换员工</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>员工姓名</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500, mt: 0.5 }}>{order.username || `用户${order.userId}`}</Typography>
              </Box>
              <Box sx={{ flex: 1, minWidth: 140 }}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>用户ID</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500, mt: 0.5 }}>{order.userId}</Typography>
              </Box>
            </Box>
          </Paper>
        </Box>

        {/* Right Column */}
        <Box sx={{ width: 380, display: 'flex', flexDirection: 'column', gap: 3 }}>
          {/* Status Timeline */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>状态记录</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
              {timeline.map((item, i) => (
                <Box key={i} sx={{ display: 'flex', gap: 2 }}>
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: item.color, mt: 0.5 }} />
                    {i < timeline.length - 1 && <Box sx={{ width: 2, flex: 1, bgcolor: '#E2E8F0', mt: 0.5 }} />}
                  </Box>
                  <Box>
                    <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{item.label}</Typography>
                    <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{item.time}</Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Order Info */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>订单信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                ['订单编号', `EX${String(order.id).padStart(6, '0')}`],
                ['下单时间', order.createdAt],
                ['订单来源', 'PC端'],
                ['备注', '无'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{k}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>

          {/* Delivery Info */}
          <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>收货信息</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
              {[
                ['收货人', order.receiverName || '—'],
                ['联系电话', order.receiverPhone || '—'],
                ['收货地址', order.receiverAddress || '—'],
              ].map(([k, v]) => (
                <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                  <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{k}</Typography>
                  <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{v}</Typography>
                </Box>
              ))}
            </Box>
          </Paper>
        </Box>
      </Box>
    </Box>
  );
}
