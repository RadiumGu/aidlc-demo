import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import CardMedia from '@mui/material/CardMedia';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import TollIcon from '@mui/icons-material/Toll';
import ImageIcon from '@mui/icons-material/Image';
import { useProductStore } from '../../store/useProductStore';

export default function ShopHome() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { products, total, loading, categories, fetchProducts, fetchCategories } = useProductStore();
  const [activeCategoryId, setActiveCategoryId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 8;

  useEffect(() => { fetchCategories(); }, [fetchCategories]);
  useEffect(() => {
    fetchProducts({ page, size: pageSize, categoryId: activeCategoryId ?? undefined });
  }, [fetchProducts, page, activeCategoryId]);

  const totalPages = Math.ceil(total / pageSize);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      {/* Hero Banner */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', height: 160, borderRadius: '12px', px: '40px', background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)' }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>{t('employee.heroTitle')}</Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>{t('employee.heroSubtitle')}</Typography>
          <Button size="small" endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />} sx={{ bgcolor: '#fff', color: '#2563EB', borderRadius: '20px', px: '20px', py: '8px', fontSize: 13, fontWeight: 600, textTransform: 'none', alignSelf: 'flex-start', '&:hover': { bgcolor: '#f0f0f0' } }}>
            {t('employee.heroBrowse')}
          </Button>
        </Box>
        <ShoppingBagIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.2)' }} />
      </Box>

      {/* Category Filter */}
      <Box sx={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
        <Chip label={t('employee.allCategories') || '全部'} onClick={() => { setActiveCategoryId(null); setPage(1); }}
          sx={{ borderRadius: '20px', fontSize: 13, fontWeight: activeCategoryId === null ? 600 : 400, color: activeCategoryId === null ? '#fff' : '#64748B', bgcolor: activeCategoryId === null ? '#2563EB' : '#fff', border: activeCategoryId === null ? 'none' : '1px solid #E2E8F0', py: '8px', px: '18px', '& .MuiChip-label': { p: 0 } }} />
        {categories.map((cat) => (
          <Chip key={cat.id} label={cat.name} onClick={() => { setActiveCategoryId(cat.id); setPage(1); }}
            sx={{ borderRadius: '20px', fontSize: 13, fontWeight: activeCategoryId === cat.id ? 600 : 400, color: activeCategoryId === cat.id ? '#fff' : '#64748B', bgcolor: activeCategoryId === cat.id ? '#2563EB' : '#fff', border: activeCategoryId === cat.id ? 'none' : '1px solid #E2E8F0', py: '8px', px: '18px', '& .MuiChip-label': { p: 0 } }} />
        ))}
      </Box>

      {/* Product Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px' }}>
          {products.map((product) => (
            <Card key={product.id} onClick={() => navigate(`/product/${product.id}`)} sx={{ borderRadius: '12px', border: '1px solid #F1F5F9', boxShadow: 'none', cursor: 'pointer', overflow: 'hidden', '&:hover': { boxShadow: 2 } }}>
              {product.imageUrl ? (
                <CardMedia component="img" height={200} image={product.imageUrl} alt={product.name} sx={{ objectFit: 'cover' }} />
              ) : (
                <Box sx={{ height: 200, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <ImageIcon sx={{ fontSize: 64, color: '#CBD5E1' }} />
                </Box>
              )}
              <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: '10px', p: '16px', '&:last-child': { pb: '16px' } }}>
                <Typography sx={{ fontSize: 15, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{product.name}</Typography>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{product.categoryName}</Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <TollIcon sx={{ fontSize: 18, color: '#D97706' }} />
                    <Typography sx={{ fontSize: 18, fontWeight: 700, color: '#D97706' }}>{product.pointsPrice.toLocaleString()}</Typography>
                  </Box>
                  <Button variant="contained" size="small" sx={{ borderRadius: '8px', px: '14px', py: '6px', fontSize: 13, fontWeight: 600, textTransform: 'none', minWidth: 'auto' }}>
                    {t('employee.redeem')}
                  </Button>
                </Box>
              </CardContent>
            </Card>
          ))}
        </Box>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'center' }}>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" />
        </Box>
      )}
    </Box>
  );
}
