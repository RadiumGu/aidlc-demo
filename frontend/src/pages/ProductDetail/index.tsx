import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import CardMedia from '@mui/material/CardMedia';
import CircularProgress from '@mui/material/CircularProgress';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import ImageIcon from '@mui/icons-material/Image';
import { productApi } from '../../services/product';
import type { ProductResponse } from '../../types/api';

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [product, setProduct] = useState<ProductResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    productApi.getProductById(Number(id)).then((res) => setProduct(res.data)).finally(() => setLoading(false));
  }, [id]);

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>;
  if (!product) return <Typography sx={{ p: 4 }}>商品不存在</Typography>;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 48px' }}>
      <Breadcrumbs sx={{ fontSize: 13, color: 'text.secondary' }}>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/')}>首页</Link>
        <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }}>{product.categoryName}</Link>
        <Typography sx={{ fontSize: 13, color: 'text.primary' }}>{product.name}</Typography>
      </Breadcrumbs>

      <Box sx={{ display: 'flex', gap: 4 }}>
        {/* Product Image */}
        <Box sx={{ width: 480, flexShrink: 0 }}>
          {product.imageUrl ? (
            <CardMedia component="img" image={product.imageUrl} alt={product.name} sx={{ height: 400, borderRadius: 3, objectFit: 'cover' }} />
          ) : (
            <Box sx={{ height: 400, bgcolor: '#F1F5F9', borderRadius: 3, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <ImageIcon sx={{ fontSize: 120, color: '#CBD5E1' }} />
            </Box>
          )}
        </Box>

        {/* Product Info */}
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Chip label={product.categoryName} size="small" variant="outlined" sx={{ fontSize: 11, height: 22, alignSelf: 'flex-start' }} />
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>{product.name}</Typography>
          <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1 }}>
            <TollIcon sx={{ fontSize: 24, color: '#D97706' }} />
            <Typography sx={{ fontSize: 32, fontWeight: 700, color: '#D97706' }}>{product.pointsPrice.toLocaleString()}</Typography>
            <Typography sx={{ fontSize: 14, color: '#D97706' }}>积分</Typography>
          </Box>
          <Chip label={`库存 ${product.stock} 件`} size="small" sx={{ bgcolor: product.stock > 0 ? '#DCFCE7' : '#FEE2E2', color: product.stock > 0 ? '#16A34A' : '#991B1B', fontSize: 12, alignSelf: 'flex-start' }} />
          {product.description && (
            <Typography sx={{ fontSize: 14, lineHeight: 1.8, color: 'text.secondary', mt: 1 }}>{product.description}</Typography>
          )}
          <Button variant="contained" size="large" startIcon={<ShoppingCartIcon />} disabled={product.stock <= 0}
            onClick={() => navigate('/confirm-redemption', { state: { product } })}
            sx={{ borderRadius: 2, px: 4, py: 1.5, fontSize: 15, fontWeight: 600, textTransform: 'none', alignSelf: 'flex-start', mt: 2 }}>
            立即兑换
          </Button>
        </Box>
      </Box>
    </Box>
  );
}
