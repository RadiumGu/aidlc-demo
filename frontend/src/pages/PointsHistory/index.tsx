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
import CircularProgress from '@mui/material/CircularProgress';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import TollIcon from '@mui/icons-material/Toll';
import { pointsApi } from '../../services/api';

interface Transaction {
  id: number;
  type: string; // EARN / DEDUCT
  amount: number;
  balance: number;
  remark: string;
  createdAt: string;
}

export default function PointsHistory() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  useEffect(() => {
    (async () => {
      try {
        const res = (await pointsApi.balance()) as unknown as {
          code: number;
          data: { balance: number };
        };
        if (res.code === 0) setBalance(res.data?.balance ?? 0);
      } catch {
        // ignore
      }
    })();
  }, []);

  const fetchTransactions = useCallback(async () => {
    setLoading(true);
    try {
      const res = (await pointsApi.transactions({
        pageNum: page + 1,
        pageSize,
      })) as unknown as {
        code: number;
        data: { list: Transaction[]; total: number };
      };
      if (res.code === 0) {
        setTransactions(res.data?.list ?? []);
        setTotal(res.data?.total ?? 0);
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '获取记录失败' : 'Failed to fetch records', severity: 'error' });
    } finally {
      setLoading(false);
    }
  }, [page, pageSize, isZh]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '24px 32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
        {isZh ? '积分明细' : 'Points History'}
      </Typography>

      {/* Balance Card */}
      <Paper
        elevation={0}
        sx={{
          display: 'flex',
          alignItems: 'center',
          gap: 2,
          p: 3,
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#F1F5F9',
          background: 'linear-gradient(135deg, #FFFBEB 0%, #FEF3C7 100%)',
        }}
      >
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 2,
            bgcolor: '#FEF3C7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <TollIcon sx={{ fontSize: 28, color: '#D97706' }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, color: '#92400E' }}>
            {isZh ? '当前积分余额' : 'Current Balance'}
          </Typography>
          <Typography sx={{ fontSize: 32, fontWeight: 700, color: '#D97706' }}>
            {balance.toLocaleString()}
          </Typography>
        </Box>
      </Paper>

      {/* Transactions Table */}
      <Paper
        elevation={0}
        sx={{
          borderRadius: 3,
          border: '1px solid',
          borderColor: '#F1F5F9',
          overflow: 'hidden',
        }}
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
                      {isZh ? '类型' : 'Type'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '金额' : 'Amount'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '余额' : 'Balance'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '备注' : 'Remark'}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', py: '10px', px: '20px' }}>
                      {isZh ? '时间' : 'Time'}
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {transactions.map((tx) => {
                    const isEarn = tx.type === 'EARN' || tx.amount > 0;
                    return (
                      <TableRow key={tx.id} sx={{ '&:last-child td': { borderBottom: 0 } }}>
                        <TableCell sx={{ py: '12px', px: '20px' }}>
                          <Chip
                            label={isEarn ? (isZh ? '收入' : 'Earn') : (isZh ? '支出' : 'Spend')}
                            size="small"
                            sx={{
                              fontSize: 11,
                              fontWeight: 500,
                              color: isEarn ? '#166534' : '#991B1B',
                              bgcolor: isEarn ? '#DCFCE7' : '#FEE2E2',
                              borderRadius: '12px',
                              height: 24,
                            }}
                          />
                        </TableCell>
                        <TableCell
                          sx={{
                            fontSize: 13,
                            fontWeight: 600,
                            color: isEarn ? '#16A34A' : '#DC2626',
                            py: '12px',
                            px: '20px',
                          }}
                        >
                          {isEarn ? '+' : ''}{tx.amount?.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, py: '12px', px: '20px' }}>
                          {tx.balance?.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: 'text.secondary', py: '12px', px: '20px' }}>
                          {tx.remark || '-'}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, color: 'text.secondary', py: '12px', px: '20px' }}>
                          {tx.createdAt}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {transactions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 6, color: 'text.secondary' }}>
                        {isZh ? '暂无记录' : 'No records'}
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
