import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Divider from '@mui/material/Divider';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import AddIcon from '@mui/icons-material/Add';
import RemoveIcon from '@mui/icons-material/Remove';
import ImageIcon from '@mui/icons-material/Image';
import TextField from '@mui/material/TextField';
import { orderApi } from '../../services/order';
import { usePointsStore } from '../../store/usePointsStore';
import { useAuthStore } from '../../store/useAuthStore';
import type { ProductResponse } from '../../types/api';

export default function ConfirmRedemption() {
  const navigate = useNavigate();
  const location = useLocation();
  const product = (location.state as { product?: ProductResponse })?.product;
  const { balance, fetchBalance } = usePointsStore();
  const { user } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [qty, setQty] = useState(1);
  const [receiverName, setReceiverName] = useState('');
  const [receiverPhone, setReceiverPhone] = useState('');
  const [receiverAddress, setReceiverAddress] = useState('');

  useEffect(() => { fetchBalance(); }, [fetchBalance]);

  if (!product) { navigate('/'); return null; }

  const totalCost = product.pointsPrice * qty;
  const remaining = balance - totalCost;

  const handleConfirm = async () => {
    if (!receiverName.trim() || !receiverPhone.trim() || !receiverAddress.trim()) {
      setError('请填写完整的收货信息');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await orderApi.createOrder({
        productId: product.id,
        username: user?.username,
        receiverName: receiverName.trim(),
        receiverPhone: receiverPhone.trim(),
        receiverAddress: receiverAddress.trim(),
      });
      navigate('/orders');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '兑换失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: 720, display: 'flex', flexDirection: 'column', gap: 3 }}>
        <Breadcrumbs sx={{ fontSize: 13 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>首页</Link>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(-1)}>{product.name}</Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>确认兑换</Typography>
        </Breadcrumbs>

        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>请确认兑换</Typography>
        {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

        {/* Product Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>商品信息</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            {product.imageUrl ? (
              <CardMedia component="img" image={product.imageUrl} sx={{ width: 80, height: 80, borderRadius: 2, objectFit: 'cover' }} />
            ) : (
              <Box sx={{ width: 80, height: 80, bgcolor: '#DBEAFE', borderRadius: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <ImageIcon sx={{ fontSize: 40, color: '#2563EB' }} />
              </Box>
            )}
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 600 }}>{product.name}</Typography>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>{product.categoryName}</Typography>
              <Typography sx={{ fontSize: 12, color: '#16A34A', mt: 0.5 }}>库存充足</Typography>
            </Box>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 0.5 }}>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>数量</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton size="small" onClick={() => setQty(Math.max(1, qty - 1))} sx={{ border: '1px solid #E2E8F0', width: 28, height: 28 }}>
                  <RemoveIcon sx={{ fontSize: 16 }} />
                </IconButton>
                <Typography sx={{ fontSize: 14, fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{qty}</Typography>
                <IconButton size="small" onClick={() => setQty(qty + 1)} sx={{ border: '1px solid #E2E8F0', width: 28, height: 28 }}>
                  <AddIcon sx={{ fontSize: 16 }} />
                </IconButton>
              </Box>
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
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>{product.pointsPrice.toLocaleString()} 积分</Typography>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>数量</Typography>
              <Typography sx={{ fontSize: 14, fontWeight: 500 }}>× {qty}</Typography>
            </Box>
            <Divider />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography sx={{ fontSize: 16, fontWeight: 600 }}>应付积分</Typography>
              <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#2563EB' }}>{totalCost.toLocaleString()} 积分</Typography>
            </Box>
          </Box>
        </Paper>

        {/* Balance Bar */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#EFF6FF', borderRadius: 2, px: 2.5, py: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <AccountBalanceWalletIcon sx={{ fontSize: 20, color: '#2563EB' }} />
            <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>当前积分余额</Typography>
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{balance.toLocaleString()} 积分</Typography>
            <Typography sx={{ fontSize: 14, color: 'text.disabled' }}>→</Typography>
            {remaining >= 0 ? (
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>兑换后剩余 {remaining.toLocaleString()} 积分</Typography>
            ) : (
              <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>积分不足</Typography>
            )}
          </Box>
        </Box>

        {/* Delivery Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>收货信息</Typography>
          <Divider sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField label="收货人" placeholder="请输入收货人姓名" size="small" fullWidth
                value={receiverName} onChange={(e) => setReceiverName(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
              <TextField label="联系电话" placeholder="请输入联系电话" size="small" fullWidth
                value={receiverPhone} onChange={(e) => setReceiverPhone(e.target.value)}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            </Box>
            <TextField label="收货地址" placeholder="请输入详细收货地址" size="small" fullWidth
              value={receiverAddress} onChange={(e) => setReceiverAddress(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </Paper>

        {/* Buttons */}
        <Box sx={{ display: 'flex', gap: 1.5, pt: 1 }}>
          <Button variant="contained" size="large" startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <CheckCircleIcon />}
            disabled={loading || remaining < 0} onClick={handleConfirm}
            sx={{ borderRadius: 2, py: 1.5, fontSize: 16, fontWeight: 600, textTransform: 'none', flex: 1 }}>
            确认兑换
          </Button>
          <Button variant="outlined" size="large" onClick={() => navigate(-1)}
            sx={{ borderRadius: 2, py: 1.5, fontSize: 14, fontWeight: 500, textTransform: 'none', flex: 1 }}>
            返回商品
          </Button>
        </Box>

        {/* Notes */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.75, pb: 2 }}>
          <Typography sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>温馨提示</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>· 兑换成功后积分将立即扣除，不可撤销</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>· 商品将在 3-5 个工作日内配送至收货地址</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.disabled' }}>· 如有问题请联系管理员处理</Typography>
        </Box>
      </Box>
    </Box>
  );
}
