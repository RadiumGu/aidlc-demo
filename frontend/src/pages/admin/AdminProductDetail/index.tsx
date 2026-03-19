import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CircularProgress from '@mui/material/CircularProgress';
import Alert from '@mui/material/Alert';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import ImageIcon from '@mui/icons-material/Image';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import InventoryIcon from '@mui/icons-material/Inventory';
import ToggleOnIcon from '@mui/icons-material/ToggleOn';
import ToggleOffIcon from '@mui/icons-material/ToggleOff';
import { adminApi } from '../../../services/admin';
import type { ProductResponse } from '../../../types/api';

export default function AdminProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Stock dialog
  const [stockOpen, setStockOpen] = useState(false);
  const [newStock, setNewStock] = useState('');
  const [stockLoading, setStockLoading] = useState(false);

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Status toggle dialog
  const [statusOpen, setStatusOpen] = useState(false);
  const [statusLoading, setStatusLoading] = useState(false);

  const fetchProduct = () => {
    if (!id) return;
    setLoading(true);
    adminApi.getProductById(Number(id))
      .then((res) => setProduct(res.data))
      .catch(() => setError('加载产品详情失败'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchProduct, [id]);

  const handleUpdateStock = async () => {
    if (!product || !newStock) return;
    setStockLoading(true);
    try {
      await adminApi.updateProduct(product.id, { stock: Number(newStock) });
      setStockOpen(false);
      setNewStock('');
      fetchProduct();
    } catch {
      setError('库存调整失败');
    } finally {
      setStockLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!product) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteProduct(product.id);
      navigate('/admin/products');
    } catch {
      setError('删除失败');
    } finally {
      setDeleteLoading(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!product) return;
    setStatusLoading(true);
    const newStatus = product.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateProduct(product.id, { status: newStatus });
      setStatusOpen(false);
      fetchProduct();
    } catch {
      setError(newStatus === 'INACTIVE' ? '下架失败' : '上架失败');
    } finally {
      setStatusLoading(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error && !product) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;
  if (!product) return null;

  const STATUS_MAP: Record<string, { label: string; color: string; bg: string }> = {
    ACTIVE: { label: '在售', color: '#16A34A', bg: '#DCFCE7' },
    INACTIVE: { label: '已下架', color: '#64748B', bg: '#F1F5F9' },
  };
  const statusCfg = STATUS_MAP[product.status] || { label: product.status, color: '#64748B', bg: '#F1F5F9' };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      {/* Stock Dialog */}
      <Dialog open={stockOpen} onClose={() => setStockOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9' }}>调整库存</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '24px !important' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>当前库存：{product.stock} 件</Typography>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>新库存数量</Typography>
            <TextField fullWidth size="small" type="number" value={newStock} onChange={(e) => setNewStock(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setStockOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
          <Button variant="contained" disabled={stockLoading} onClick={handleUpdateStock} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>确认调整</Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9' }}>确认删除</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography sx={{ fontSize: 14 }}>确定要删除商品「{product.name}」吗？此操作不可撤销。</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
          <Button variant="contained" color="error" disabled={deleteLoading} onClick={handleDelete} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>确认删除</Button>
        </DialogActions>
      </Dialog>

      {/* Status Toggle Dialog */}
      <Dialog open={statusOpen} onClose={() => setStatusOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9' }}>
          {product.status === 'ACTIVE' ? '确认下架' : '确认上架'}
        </DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography sx={{ fontSize: 14 }}>
            {product.status === 'ACTIVE'
              ? `确定要下架商品「${product.name}」吗？下架后员工将无法兑换该商品。`
              : `确定要上架商品「${product.name}」吗？上架后员工可以兑换该商品。`}
          </Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setStatusOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
          <Button variant="contained" color={product.status === 'ACTIVE' ? 'warning' : 'success'} disabled={statusLoading} onClick={handleToggleStatus} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
            {product.status === 'ACTIVE' ? '确认下架' : '确认上架'}
          </Button>
        </DialogActions>
      </Dialog>

      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      {/* Breadcrumb + Actions */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs sx={{ fontSize: 13 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/products')}>产品管理</Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>产品详情</Typography>
        </Breadcrumbs>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button size="small" variant="outlined" color="primary" startIcon={<InventoryIcon />} onClick={() => { setNewStock(String(product.stock)); setStockOpen(true); }} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>调整库存</Button>
          <Button size="small" variant="contained" startIcon={<EditIcon />} onClick={() => navigate(`/admin/products/${product.id}/edit`)} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>编辑</Button>
          {product.status === 'ACTIVE' ? (
            <Button size="small" variant="outlined" color="warning" startIcon={<ToggleOffIcon />} onClick={() => setStatusOpen(true)} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>下架</Button>
          ) : (
            <Button size="small" variant="outlined" color="success" startIcon={<ToggleOnIcon />} onClick={() => setStatusOpen(true)} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>上架</Button>
          )}
          {product.status === 'INACTIVE' && (
            <Button size="small" variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={() => setDeleteOpen(true)} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>删除</Button>
          )}
        </Box>
      </Box>

      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{product.name}</Typography>
        <Chip label={statusCfg.label} size="small" sx={{ bgcolor: statusCfg.bg, color: statusCfg.color, fontSize: 11 }} />
      </Box>

      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Left: Image */}
        <Box sx={{ width: 360, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>商品图片</Typography>
          <Box sx={{ height: 280, bgcolor: '#F1F5F9', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
            {product.imageUrl ? (
              <img src={product.imageUrl} alt={product.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            ) : (
              <ImageIcon sx={{ fontSize: 80, color: '#94A3B8' }} />
            )}
          </Box>
        </Box>

        {/* Right: Basic Info */}
        <Paper elevation={0} sx={{ flex: 1, borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>基本信息</Typography>
          <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
            {[
              ['商品名称', product.name],
              ['商品分类', product.categoryName || '-'],
              ['积分价格', `${product.pointsPrice.toLocaleString()} 积分`],
              ['库存数量', `${product.stock} 件`],
              ['状态', statusCfg.label],
              ['创建时间', product.createdAt],
            ].map(([label, value]) => (
              <Box key={label}>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 0.5 }}>{label}</Typography>
                <Typography sx={{ fontSize: 14 }}>{value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>
      </Box>

      {/* Description */}
      {product.description && (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>商品描述</Typography>
          <Typography sx={{ fontSize: 14, lineHeight: 1.8, color: 'text.secondary' }}>{product.description}</Typography>
        </Paper>
      )}
    </Box>
  );
}
