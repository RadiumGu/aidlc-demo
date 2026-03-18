import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Rating from '@mui/material/Rating';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import WatchIcon from '@mui/icons-material/Watch';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import BackpackIcon from '@mui/icons-material/Backpack';
import TollIcon from '@mui/icons-material/Toll';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { productApi, orderApi } from '../../services/api';
import type { SvgIconComponent } from '@mui/icons-material';

const CATEGORIES = [
  { key: 'all', label: '全部' },
  { key: 'digital', label: '数码电子' },
  { key: 'life', label: '生活家居' },
  { key: 'food', label: '美食餐饮' },
  { key: 'gift', label: '礼品卡券' },
  { key: 'office', label: '办公用品' },
];

const ICON_MAP: Record<string, SvgIconComponent> = {
  digital: HeadphonesIcon,
  life: BackpackIcon,
  gift: CardGiftcardIcon,
  food: ShoppingCartIcon,
  office: WatchIcon,
};

const BG_MAP: Record<string, { bgColor: string; iconColor: string }> = {
  digital: { bgColor: '#DBEAFE', iconColor: '#2563EB' },
  life: { bgColor: '#FEF3C7', iconColor: '#D97706' },
  gift: { bgColor: '#DCFCE7', iconColor: '#16A34A' },
  food: { bgColor: '#FCE7F3', iconColor: '#DB2777' },
  office: { bgColor: '#EDE9FE', iconColor: '#7C3AED' },
};

interface Product {
  id: number;
  name: string;
  category: string;
  categoryLabel?: string;
  rating?: number;
  reviews?: number;
  sold?: number;
  pointsPrice: number;
  points?: number;
  imageUrl?: string;
  status?: string;
}

export default function ShopHome() {
  const { t } = useTranslation();
  const [activeCategory, setActiveCategory] = useState('all');
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await productApi.list({
        pageNum: 1,
        pageSize: 50,
        category: activeCategory === 'all' ? undefined : activeCategory,
      })) as unknown as {
        code: number;
        data: { list: Product[]; total: number };
      };
      if (res.code === 0) {
        setProducts(res.data?.list ?? []);
      }
    } catch {
      setSnackbar({ open: true, message: '获取商品失败', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleRedeem = async (productId: number) => {
    try {
      const res = (await orderApi.create({
        productId,
        quantity: 1,
      })) as unknown as { code: number; message: string };
      if (res.code === 0) {
        setSnackbar({ open: true, message: '兑换成功！', severity: 'success' });
      } else {
        setSnackbar({
          open: true,
          message: res.message || '兑换失败',
          severity: 'error',
        });
      }
    } catch {
      setSnackbar({ open: true, message: '兑换失败，请稍后重试', severity: 'error' });
    }
  };

  return (
    <Box
      sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}
    >
      {/* Hero Banner */}
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          height: 160,
          borderRadius: '12px',
          px: '40px',
          background: 'linear-gradient(90deg, #2563EB 0%, #60A5FA 100%)',
        }}
      >
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <Typography sx={{ fontSize: 28, fontWeight: 700, color: '#fff' }}>
            {t('employee.heroTitle')}
          </Typography>
          <Typography sx={{ fontSize: 14, color: 'rgba(255,255,255,0.8)' }}>
            {t('employee.heroSubtitle')}
          </Typography>
          <Button
            size="small"
            endIcon={<ArrowForwardIcon sx={{ fontSize: 16 }} />}
            sx={{
              bgcolor: '#fff',
              color: '#2563EB',
              borderRadius: '20px',
              px: '20px',
              py: '8px',
              fontSize: 13,
              fontWeight: 600,
              textTransform: 'none',
              alignSelf: 'flex-start',
              '&:hover': { bgcolor: '#f0f0f0' },
            }}
          >
            {t('employee.heroBrowse')}
          </Button>
        </Box>
        <ShoppingBagIcon sx={{ fontSize: 100, color: 'rgba(255,255,255,0.2)' }} />
      </Box>

      {/* Category Filter */}
      <Box sx={{ display: 'flex', gap: '8px' }}>
        {CATEGORIES.map((cat) => (
          <Chip
            key={cat.key}
            label={cat.label}
            onClick={() => setActiveCategory(cat.key)}
            sx={{
              borderRadius: '20px',
              fontSize: 13,
              fontWeight: activeCategory === cat.key ? 600 : 400,
              color: activeCategory === cat.key ? '#fff' : '#64748B',
              bgcolor: activeCategory === cat.key ? '#2563EB' : '#fff',
              border:
                activeCategory === cat.key ? 'none' : '1px solid #E2E8F0',
              height: 'auto',
              py: '8px',
              px: '18px',
              '& .MuiChip-label': { p: 0 },
              '&:hover': {
                bgcolor: activeCategory === cat.key ? '#2563EB' : '#F8FAFC',
              },
            }}
          />
        ))}
      </Box>

      {/* Product Grid */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '20px',
          }}
        >
          {products.map((product) => {
            const cat = product.category?.toLowerCase() ?? 'digital';
            const IconComp = ICON_MAP[cat] || HeadphonesIcon;
            const colors = BG_MAP[cat] || BG_MAP.digital;
            return (
              <Card
                key={product.id}
                sx={{
                  borderRadius: '12px',
                  border: '1px solid',
                  borderColor: '#F1F5F9',
                  boxShadow: 'none',
                  cursor: 'pointer',
                  overflow: 'hidden',
                  '&:hover': { boxShadow: 2 },
                }}
              >
                {/* Product Image Area */}
                <Box
                  sx={{
                    position: 'relative',
                    height: 200,
                    bgcolor: colors.bgColor,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <IconComp sx={{ fontSize: 64, color: colors.iconColor }} />
                </Box>

                <CardContent
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '10px',
                    p: '16px',
                    '&:last-child': { pb: '16px' },
                  }}
                >
                  <Typography
                    sx={{
                      fontSize: 15,
                      fontWeight: 600,
                      color: 'text.primary',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {product.name}
                  </Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>
                    {product.categoryLabel || product.category}
                  </Typography>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Rating
                      value={product.rating ?? 4}
                      precision={0.5}
                      size="small"
                      readOnly
                      sx={{
                        '& .MuiRating-iconFilled': { color: '#F59E0B' },
                        '& .MuiRating-iconHover': { color: '#F59E0B' },
                        '& .MuiRating-iconEmpty': { color: '#E2E8F0' },
                        fontSize: 14,
                      }}
                    />
                    <Typography sx={{ fontSize: 11, color: '#64748B' }}>
                      {product.rating ?? 4} ({product.reviews ?? 0})
                    </Typography>
                    <Typography sx={{ fontSize: 11, color: '#CBD5E1' }}>
                      · {t('employee.sold')} {product.sold ?? 0}{' '}
                      {t('employee.soldUnit')}
                    </Typography>
                  </Box>
                  <Box
                    sx={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                    }}
                  >
                    <Box
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <TollIcon sx={{ fontSize: 18, color: '#D97706' }} />
                      <Typography
                        sx={{ fontSize: 18, fontWeight: 700, color: '#D97706' }}
                      >
                        {(product.pointsPrice ?? product.points ?? 0).toLocaleString()}
                      </Typography>
                    </Box>
                    <Button
                      variant="contained"
                      size="small"
                      onClick={() => handleRedeem(product.id)}
                      sx={{
                        borderRadius: '8px',
                        px: '14px',
                        py: '6px',
                        fontSize: 13,
                        fontWeight: 600,
                        textTransform: 'none',
                        minWidth: 'auto',
                      }}
                    >
                      {t('employee.redeem')}
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            );
          })}
        </Box>
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
