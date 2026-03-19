import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
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
import CircularProgress from '@mui/material/CircularProgress';
import SaveIcon from '@mui/icons-material/Save';
import { productApi } from '../../../services/product';
import { adminApi } from '../../../services/admin';
import ImageUpload from '../../../components/ImageUpload';
import type { ProductResponse, CategoryTreeNode } from '../../../types/api';

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [pointsPrice, setPointsPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    if (!id) return;
    Promise.all([
      adminApi.getProductById(Number(id)),
      productApi.getCategoryTree(),
    ]).then(([prodRes, catRes]) => {
      const p = prodRes.data;
      setProduct(p);
      setName(p.name);
      setDescription(p.description || '');
      setPointsPrice(String(p.pointsPrice));
      setStock(String(p.stock));
      setCategoryId(p.categoryId);
      setImageUrl(p.imageUrl || '');
      setCategories(catRes.data);
    }).catch(() => setError('加载数据失败'))
      .finally(() => setLoading(false));
  }, [id]);

  const flatCategories = (nodes: CategoryTreeNode[]): { id: number; name: string }[] =>
    nodes.flatMap((n) => [{ id: n.id, name: n.name }, ...flatCategories(n.children)]);

  const handleSave = async () => {
    if (!product || !name || !pointsPrice || !stock || !categoryId) { setError('请填写必填项'); return; }
    setSaving(true);
    setError('');
    setSuccess(false);
    try {
      await adminApi.updateProduct(product.id, {
        name,
        description,
        pointsPrice: Number(pointsPrice),
        stock: Number(stock),
        categoryId: categoryId as number,
        imageUrl: imageUrl || undefined,
      });
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (error && !product) return <Box sx={{ p: 4 }}><Alert severity="error">{error}</Alert></Box>;
  if (!product) return null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Breadcrumbs sx={{ fontSize: 13 }}>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/products')}>产品管理</Link>
          <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate(`/admin/products/${product.id}`)}>产品详情</Link>
          <Typography sx={{ fontSize: 13, color: 'text.primary' }}>编辑商品</Typography>
        </Breadcrumbs>
        <Button size="small" variant="contained" startIcon={<SaveIcon />} disabled={saving} onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13 }}>保存修改</Button>
      </Box>

      <Typography sx={{ fontSize: 24, fontWeight: 700 }}>编辑商品信息</Typography>
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}
      {success && <Alert severity="success" sx={{ borderRadius: 2 }}>保存成功</Alert>}

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
