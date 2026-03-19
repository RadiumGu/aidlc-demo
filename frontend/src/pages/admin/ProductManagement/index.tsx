import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import SearchIcon from '@mui/icons-material/Search';
import AddIcon from '@mui/icons-material/Add';
import TollIcon from '@mui/icons-material/Toll';
import ImageIcon from '@mui/icons-material/Image';
import { adminApi } from '../../../services/admin';
import { productApi } from '../../../services/product';
import type { ProductResponse, CategoryTreeNode } from '../../../types/api';

export default function ProductManagement() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<ProductResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [categoryId, setCategoryId] = useState<number | ''>('');
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const pageSize = 8;

  useEffect(() => { productApi.getCategoryTree().then((r) => setCategories(r.data)); }, []);

  const fetchData = () => {
    setLoading(true);
    adminApi.getProducts({ page, size: pageSize, keyword: keyword || undefined, categoryId: categoryId || undefined })
      .then((r) => { setProducts(r.data.records); setTotal(r.data.total); })
      .finally(() => setLoading(false));
  };
  useEffect(fetchData, [page, categoryId]);

  const flatCats = (nodes: CategoryTreeNode[]): { id: number; name: string }[] =>
    nodes.flatMap((n) => [{ id: n.id, name: n.name }, ...flatCats(n.children)]);
  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '32px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>产品管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={() => navigate('/admin/products/new')} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>新增产品</Button>
      </Box>

      <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
        <TextField size="small" placeholder="搜索商品..." value={keyword} onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> } }}
          sx={{ width: 240, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <Select size="small" value={categoryId} onChange={(e) => { setCategoryId(e.target.value as number | ''); setPage(1); }} displayEmpty sx={{ width: 140, borderRadius: 2 }}>
          <MenuItem value="">全部分类</MenuItem>
          {flatCats(categories).map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
        </Select>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>共 {total} 件产品</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {products.map((product) => (
            <Card key={product.id} onClick={() => navigate(`/admin/products/${product.id}`)} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', boxShadow: 'none', cursor: 'pointer', overflow: 'hidden', '&:hover': { boxShadow: 2 } }}>
              {product.imageUrl ? (
                <CardMedia component="img" height={160} image={product.imageUrl} alt={product.name} sx={{ objectFit: 'cover' }} />
              ) : (
                <Box sx={{ height: 160, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon sx={{ fontSize: 56, color: '#CBD5E1' }} />
                </Box>
              )}
              <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary', mb: 1 }}>{product.categoryName}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    <TollIcon sx={{ fontSize: 16, color: '#D97706' }} />
                    <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#D97706' }}>{product.pointsPrice.toLocaleString()}</Typography>
                  </Box>
                  <Chip label={product.status === 'ACTIVE' ? '在售' : '已下架'} size="small"
                    sx={{ bgcolor: product.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2', color: product.status === 'ACTIVE' ? '#16A34A' : '#991B1B', fontSize: 11, height: 22 }} />
                </Box>
                <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                  <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>库存 {product.stock}</Typography>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>共 {total} 件产品</Typography>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
