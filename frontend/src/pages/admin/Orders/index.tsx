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
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import { orderApi } from '../../../services/api';

interface Order {
  id: number;
  orderNo?: string;
  username?: string;
  productName: string;
  points?: number;
  totalPoints?: number;
  status: string;
  createdAt: string;
}

const STATUS_CONFIG: Record<string, { label: string; labelEn: string; color: string; bg: string }> = {
  PENDING: { label: '待处理', labelEn: 'Pending', color: '#92400E', bg: '#FEF3C7' },
  TO_SHIP: { label: '待发货', labelEn: 'To Ship', color: '#1E40AF', bg: '#DBEAFE' },
  SHIPPED: { label: '已发货', labelEn: 'Shipped', color: '#7C3AED', bg: '#EDE9FE' },
  COMPLETED: { label: '已完成', labelEn: 'Completed', color: '#166534', bg: '#DCFCE7' },
  CANCELLED: { label: '已取消', labelEn: 'Cancelled', color: '#991B1B', bg: '#FEE2E2' },
};

export default function AdminOrders() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  const [orders, setOrders] = useState<Order[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const fetchOrders = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await orderApi.adminList({
        pageNum: page + 1,
        pageSize,
      })) as unknown as {
        code: number;
        data: { list: Order[]; total: number };
      };
      if (res.code === 0) {
        setOrders(res.data?.list ?? []);
        setTotal(res.data?.total ?? 0);
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '获取订单失败' : 'Failed to fetch orders', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isZh]);

  useEffect(() => {
    fetchOrders();
  }, [fetchOrders]);

  const handleShip = async (orderId: number) => {
    try {
      const res = (await orderApi.ship({ orderId })) as unknown as {
        code: number;
        message: string;
      };
      if (res.code === 0) {
        setSnackbar({ open: true, message: isZh ? '发货成功' : 'Shipped', severity: 'success' });
        fetchOrders();
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '操作失败' : 'Operation failed', severity: 'error' });
    }
  };

  const handleComplete = async (orderId: number) => {
    try {
      const res = (await orderApi.complete({ orderId })) as unknown as {
        code: number;
        message: string;
      };
      if (res.code === 0) {
        setSnackbar({ open: true, message: isZh ? '已完成' : 'Completed', severity: 'success' });
        fetchOrders();
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '操作失败' : 'Operation failed', severity: 'error' });
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
        {isZh ? '订单管理' : 'Order Management'}
      </Typography>

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
                      {isZh ? '订单号' : 'Order No.'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '用户' : 'User'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '商品' : 'Product'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '积分' : 'Points'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '状态' : 'Status'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '时间' : 'Time'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '操作' : 'Actions'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {orders.map((order) => {
                    const statusCfg = STATUS_CONFIG[order.status] || STATUS_CONFIG.PENDING;
                    return (
                      <TableRow key={order.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>
                          {order.orderNo || `#${order.id}`}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>
                          {order.username || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>
                          {order.productName}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, py: '12px', px: '20px', fontWeight: 600, color: '#D97706' }}>
                          {(order.totalPoints ?? order.points ?? 0)?.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ py: '12px', px: '20px' }}>
                          <Chip
                            label={isZh ? statusCfg.label : statusCfg.labelEn}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: statusCfg.color,
                              bgcolor: statusCfg.bg,
                              borderRadius: '12px',
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: 'text.secondary', py: '12px', px: '20px' }}>
                          {order.createdAt}
                        </TableCell>
                        <TableCell sx={{ py: '12px', px: '20px' }}>
                          {order.status === 'TO_SHIP' && (
                            <Button
                              size="small"
                              variant="outlined"
                              onClick={() => handleShip(order.id)}
                              sx={{ fontSize: 12, textTransform: 'none', mr: 1 }}
                            >
                              {isZh ? '发货' : 'Ship'}
                            </Button>
                          )}
                          {order.status === 'SHIPPED' && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="success"
                              onClick={() => handleComplete(order.id)}
                              sx={{ fontSize: 12, textTransform: 'none' }}
                            >
                              {isZh ? '确认完成' : 'Complete'}
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        {isZh ? '暂无订单' : 'No orders'}
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
