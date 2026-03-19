import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Alert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import { adminApi } from '../../../services/admin';
import { productApi } from '../../../services/product';
import ImageUpload from '../../../components/ImageUpload';
import type { CategoryTreeNode } from '../../../types/api';

export default function NewProduct() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsPrice, setPointsPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    productApi.getCategoryTree().then((res) => setCategories(res.data));
  }, []);

  const flatCategories = (nodes: CategoryTreeNode[]): { id: number; name: string }[] =>
    nodes.flatMap((n) => [{ id: n.id, name: n.name }, ...flatCategories(n.children)]);

  const handleSave = async () => {
    if (!name || !pointsPrice || !stock || !categoryId) { setError('请填写必填项'); return; }
    setLoading(true);
    setError('');
    try {
      await adminApi.createProduct({ name, description, pointsPrice: Number(pointsPrice), stock: Number(stock), categoryId: categoryId as number, imageUrl: imageUrl || undefined });
      navigate('/admin/products');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '创建失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs sx={{ fontSize: 13 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/products')}>产品管理</Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>新增商品</Typography>
        </Breadcrumbs>
        <Button size="small" variant="contained" startIcon={<SaveIcon />} disabled={loading} onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>创建商品</Button>
      </Box>

      <Typography sx={{ fontSize: 24, fontWeight: 700 }}>新增商品</Typography>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>基本信息</Typography>
        <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 3 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>商品名称 *</Typography>
            <TextField fullWidth size="small" value={name} onChange={(e) => setName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>商品分类 *</Typography>
            <Select fullWidth size="small" value={categoryId} onChange={(e) => setCategoryId(e.target.value as number)} sx={{ borderRadius: 2 }}>
              {flatCategories(categories).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
            </Select>
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>积分价格 *</Typography>
            <TextField fullWidth size="small" type="number" value={pointsPrice} onChange={(e) => setPointsPrice(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>库存 *</Typography>
            <TextField fullWidth size="small" type="number" value={stock} onChange={(e) => setStock(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </Box>
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>商品描述</Typography>
        <TextField fullWidth multiline rows={4} value={description} onChange={(e) => setDescription(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
      </Paper>

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3 }}>
        <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 3 }}>商品图片</Typography>
        <ImageUpload value={imageUrl} onChange={setImageUrl} />
      </Paper>
    </Box>
  );
}
