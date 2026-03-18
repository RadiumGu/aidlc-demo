import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import Chip from '@mui/material/Chip';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import AddIcon from '@mui/icons-material/Add';
import { productApi } from '../../../services/api';

interface Product {
  id: number;
  name: string;
  category: string;
  points?: number;
  pointsPrice?: number;
  stock: number;
  status: number;
  description?: string;
}

const CATEGORIES = [
  { value: 'digital', label: '数码电子', labelEn: 'Digital' },
  { value: 'life', label: '生活家居', labelEn: 'Life' },
  { value: 'food', label: '美食餐饮', labelEn: 'Food' },
  { value: 'gift', label: '礼品卡券', labelEn: 'Gift Card' },
  { value: 'office', label: '办公用品', labelEn: 'Office' },
];

const EMPTY_FORM = {
  name: '',
  category: 'digital',
  points: 0,
  stock: 0,
  description: '',
};

export default function AdminProducts() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  const [products, setProducts] = useState<Product[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editId, setEditId] = useState<number | null>(null);
  const [form, setForm] = useState({ ...EMPTY_FORM });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await productApi.list({
        pageNum: page + 1,
        pageSize,
      })) as unknown as {
        code: number;
        data: { list: Product[]; total: number };
      };
      if (res.code === 0) {
        setProducts(res.data?.list ?? []);
        setTotal(res.data?.total ?? 0);
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '获取商品失败' : 'Failed to fetch', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isZh]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleStatusToggle = async (product: Product) => {
    const newStatus = product.status === 1 ? 0 : 1;
    try {
      const res = (await productApi.updateStatus({
        id: product.id,
        status: newStatus,
      })) as unknown as { code: number; message: string };
      if (res.code === 0) {
        fetchProducts();
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '操作失败' : 'Operation failed', severity: 'error' });
    }
  };

  const openCreate = () => {
    setEditId(null);
    setForm({ ...EMPTY_FORM });
    setDialogOpen(true);
  };

  const openEdit = (product: Product) => {
    setEditId(product.id);
    setForm({
      name: product.name,
      category: product.category,
      points: product.pointsPrice ?? product.points ?? 0,
      stock: product.stock,
      description: product.description || '',
    });
    setDialogOpen(true);
  };

  const handleSubmit = async () => {
    try {
      const payload = { ...form, ...(editId ? { id: editId } : {}) };
      const res = (editId
        ? await productApi.update(payload)
        : await productApi.create(payload)) as unknown as {
        code: number;
        message: string;
      };
      if (res.code === 0) {
        setSnackbar({
          open: true,
          message: isZh ? (editId ? '更新成功' : '创建成功') : (editId ? 'Updated' : 'Created'),
          severity: 'success',
        });
        setDialogOpen(false);
        fetchProducts();
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '操作失败' : 'Operation failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
          {isZh ? '商品管理' : 'Product Management'}
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={openCreate}
          sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}
        >
          {isZh ? '新建商品' : 'New Product'}
        </Button>
      </Box>

      <Paper
        elevation={0}
        sx={{ borderRadius: 3, border: '1px solid', borderColor: '#F1F5F9', overflow: 'hidden' }}
      >
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table sx={{ '& .MuiTableCell-root': { borderColor: '#F1F5F9' } }}>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '名称' : 'Name'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '分类' : 'Category'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '积分' : 'Points'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '库存' : 'Stock'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '状态' : 'Status'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '操作' : 'Actions'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                      <TableCell sx={{ fontSize: 13, py: '12px', px: '20px', fontWeight: 500 }}>
                        {product.name}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>
                        {product.category}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, py: '12px', px: '20px', fontWeight: 600, color: '#D97706' }}>
                        {(product.pointsPrice ?? product.points ?? 0)?.toLocaleString()}
                      </TableCell>
                      <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>
                        {product.stock}
                      </TableCell>
                      <TableCell sx={{ py: '12px', px: '20px' }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Switch
                            size="small"
                            checked={product.status === 1}
                            onChange={() => handleStatusToggle(product)}
                          />
                          <Chip
                            label={
                              product.status === 1
                                ? (isZh ? '上架' : 'Active')
                                : (isZh ? '下架' : 'Inactive')
                            }
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: product.status === 1 ? '#166534' : '#991B1B',
                              bgcolor: product.status === 1 ? '#DCFCE7' : '#FEE2E2',
                              borderRadius: '12px',
                              height: 24,
                            }}
                          />
                        </Box>
                      </TableCell>
                      <TableCell sx={{ py: '12px', px: '20px' }}>
                        <Button
                          size="small"
                          onClick={() => openEdit(product)}
                          sx={{ fontSize: 12, textTransform: 'none' }}
                        >
                          {isZh ? '编辑' : 'Edit'}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        {isZh ? '暂无商品' : 'No products'}
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
            <TablePagination
              component="div"
              count={total}
              page={page}
              onPageChange={(_, p) => setPage(p)}
              rowsPerPage={pageSize}
              onRowsPerPageChange={(e) => {
                setPageSize(parseInt(e.target.value, 10));
                setPage(0);
              }}
              rowsPerPageOptions={[5, 10, 25]}
            />
          </>
        )}
      </Paper>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>
          {editId ? (isZh ? '编辑商品' : 'Edit Product') : (isZh ? '新建商品' : 'New Product')}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '16px !important' }}>
          <TextField
            label={isZh ? '商品名称' : 'Product Name'}
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            fullWidth
            size="small"
          />
          <TextField
            label={isZh ? '分类' : 'Category'}
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
            select
            fullWidth
            size="small"
          >
            {CATEGORIES.map((c) => (
              <MenuItem key={c.value} value={c.value}>
                {isZh ? c.label : c.labelEn}
              </MenuItem>
            ))}
          </TextField>
          <TextField
            label={isZh ? '积分' : 'Points'}
            type="number"
            value={form.points}
            onChange={(e) => setForm({ ...form, points: Number(e.target.value) })}
            fullWidth
            size="small"
          />
          <TextField
            label={isZh ? '库存' : 'Stock'}
            type="number"
            value={form.stock}
            onChange={(e) => setForm({ ...form, stock: Number(e.target.value) })}
            fullWidth
            size="small"
          />
          <TextField
            label={isZh ? '描述' : 'Description'}
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            fullWidth
            size="small"
            multiline
            rows={3}
          />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDialogOpen(false)} sx={{ textTransform: 'none' }}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
          <Button variant="contained" onClick={handleSubmit} sx={{ textTransform: 'none' }}>
            {isZh ? '确定' : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
