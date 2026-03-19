import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import RadioButtonUncheckedIcon from '@mui/icons-material/RadioButtonUnchecked';
import ImageIcon from '@mui/icons-material/Image';
import { orderApi } from '../../services/order';
import type { OrderResponse } from '../../types/api';

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  PENDING: { label: '待发货', color: '#166534', bg: '#DCFCE7' },
  READY: { label: '已发货', color: '#1E40AF', bg: '#DBEAFE' },
  COMPLETED: { label: '已完成', color: '#166534', bg: '#DCFCE7' },
  CANCELLED: { label: '已取消', color: '#991B1B', bg: '#FEE2E2' },
};

const TIMELINE_STEPS = [
  { key: 'submitted', label: '订单提交成功', desc: '订单已提交，等待处理' },
  { key: 'processing', label: '商品准备中', desc: '订单已确认，商品准备中' },
  { key: 'shipped', label: '已发货', desc: '' },
  { key: 'completed', label: '交易完成', desc: '' },
];

function getActiveStep(status: string) {
  switch (status) {
    case 'PENDING': return 1;
    case 'READY': return 2;
    case 'COMPLETED': return 3;
    default: return 0;
  }
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [order, setOrder] = useState<OrderResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    orderApi.getOrderById(Number(id)).then((res) => setOrder(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!order) return <Typography sx={{ p: 4 }}>订单不存在</Typography>;

  const statusCfg = STATUS_CONFIG[order.status] ?? { label: order.status, color: '#64748B', bg: '#F1F5F9' };
  const activeStep = getActiveStep(order.status);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: 780, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Page Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography sx={{ fontSize: 24, fontWeight: 700 }}>订单详情</Typography>
            <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>订单编号：{order.id}</Typography>
          </Box>
          <Chip label={statusCfg.label} sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontWeight: 600, borderRadius: '20px', px: 1 }} />
        </Box>

        {/* Status Timeline Card */}
        {order.status !== 'CANCELLED' && (
          <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>订单状态</Typography>
            <Divider sx={{ mb: 2 }} />
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {TIMELINE_STEPS.map((step, i) => {
                const isActive = i <= activeStep;
                const isCurrent = i === activeStep;
                const isLast = i === TIMELINE_STEPS.length - 1;
                return (
                  <Box key={step.key} sx={{ display: 'flex', gap: 2 }}>
                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: 24 }}>
                      {isActive ? (
                        <CheckCircleIcon sx={{ fontSize: 20, color: isCurrent ? '#2563EB' : '#16A34A' }} />
                      ) : (
                        <RadioButtonUncheckedIcon sx={{ fontSize: 20, color: '#CBD5E1' }} />
                      )}
                      {!isLast && <Box sx={{ width: 2, flex: 1, bgcolor: isActive ? '#2563EB' : '#E2E8F0', minHeight: 24 }} />}
                    </Box>
                    <Box sx={{ pb: isLast ? 0 : 2, flex: 1 }}>
                      <Typography sx={{ fontSize: 14, fontWeight: isCurrent ? 600 : 500, color: isActive ? (isCurrent ? '#2563EB' : 'text.primary') : 'text.disabled' }}>
                        {step.label}
                      </Typography>
                      {step.desc && (
                        <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.25 }}>{step.desc}</Typography>
                      )}
                    </Box>
                  </Box>
                );
              })}
            </Box>
          </Paper>
        )}

        {/* Product Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>商品信息</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {order.productImageUrl ? (
              <CardMedia component="img" image={order.productImageUrl} sx={{ width: 72, height: 72, borderRadius: 2, objectFit: 'cover' }} />
            ) : (
              <Box sx={{ width: 72, height: 72, bgcolor: '#F1F5F9', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon sx={{ fontSize: 36, color: '#CBD5E1' }} />
              </Box>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{order.productName}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>数量：1</Typography>
            </Box>
            <Box sx={{ textAlign: 'right' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#D97706' }}>{order.pointsCost.toLocaleString()} 积分</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Points Detail Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>积分明细</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>商品积分价</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{order.pointsCost.toLocaleString()} 积分</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>实付积分</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>{order.pointsCost.toLocaleString()} 积分</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Delivery Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>收货信息</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[['收货人', order.receiverName || '—'], ['联系电话', order.receiverPhone || '—'], ['收货地址', order.receiverAddress || '—']].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{k}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Order Info Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>订单信息</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {[
              ['订单编号', String(order.id)],
              ['下单时间', order.createdAt],
              ['支付方式', '积分支付'],
              ['订单来源', 'AWSome Shop 网页版'],
            ].map(([k, v]) => (
              <Box key={k} sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>{k}</Typography>
                <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{v}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            <Button variant="contained" onClick={() => navigate('/orders')} sx={{ borderRadius: 2, px: 3, py: 1.25, textTransform: 'none', fontWeight: 600, fontSize: 14 }}>
              返回订单列表
            </Button>
            <Button variant="outlined" sx={{ borderRadius: 2, px: 3, py: 1.25, textTransform: 'none', fontWeight: 500, fontSize: 14 }}>
              联系客服
            </Button>
          </Box>
          {(order.status === 'READY' || order.status === 'PENDING') && (
            <Button variant="contained" color="success" sx={{ borderRadius: 2, px: 3, py: 1.25, textTransform: 'none', fontWeight: 600, fontSize: 14 }}>
              确认收货
            </Button>
          )}
        </Box>
      </Box>
    </Box>
  );
}
