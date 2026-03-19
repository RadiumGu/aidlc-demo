import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Breadcrumbs from '@mui/material/Breadcrumbs';
import Link from '@mui/material/Link';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import Avatar from '@mui/material/Avatar';
import IconButton from '@mui/material/IconButton';
import TuneIcon from '@mui/icons-material/Tune';
import TollIcon from '@mui/icons-material/Toll';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import { adminApi } from '../../../services/admin';
import type { PointTransactionResponse, UserResponse } from '../../../types/api';

const TYPE_MAP: Record<string, { label: string; color: string; bg: string }> = {
  SALARY: { label: '月度发放', color: '#16A34A', bg: '#DCFCE7' },
  REWARD: { label: '奖励', color: '#2563EB', bg: '#DBEAFE' },
  DEDUCTION: { label: '兑换消耗', color: '#DC2626', bg: '#FEE2E2' },
  ADJUSTMENT: { label: '手动调整', color: '#2563EB', bg: '#DBEAFE' },
  ROLLBACK: { label: '回滚', color: '#7C3AED', bg: '#EDE9FE' },
};

function getTypeInfo(type: string) {
  return TYPE_MAP[type] || { label: type, color: '#64748B', bg: '#F1F5F9' };
}

export default function UserPointsHistory() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const uid = Number(id);

  const [typeFilter, setTypeFilter] = useState('ALL');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [rows, setRows] = useState<PointTransactionResponse[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [user, setUser] = useState<UserResponse | null>(null);

  // Adjust dialog
  const [adjustOpen, setAdjustOpen] = useState(false);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [userBalance, setUserBalance] = useState(0);

  const fetchData = useCallback(async () => {
    if (!uid) return;
    setLoading(true);
    try {
      const typeParam = typeFilter === 'ALL' ? undefined : typeFilter;
      const res = await adminApi.getTransactions(uid, { page, size: 20, type: typeParam });
      setRows(res.data.records);
      setTotal(res.data.total);
      setTotalPages(res.data.pages);
    } catch {
      setRows([]);
    } finally {
      setLoading(false);
    }
  }, [uid, page, typeFilter]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => {
    if (uid) {
      adminApi.getUserById(uid).then((r) => setUser(r.data)).catch(() => {});
      adminApi.getBalances({ page: 1, size: 1000 }).then((r) => {
        const b = r.data.records.find((x) => x.userId === uid);
        if (b) setUserBalance(b.balance);
      }).catch(() => {});
    }
  }, [uid]);

  // Compute stats from loaded rows (approximate from current page)
  const totalEarned = rows.filter((r) => r.amount > 0).reduce((s, r) => s + r.amount, 0);
  const totalSpent = rows.filter((r) => r.amount < 0).reduce((s, r) => s + Math.abs(r.amount), 0);
  const adjustTotal = rows.filter((r) => r.type === 'ADJUSTMENT').reduce((s, r) => s + r.amount, 0);

  const REASON_OPTIONS = ['活动补发', '绩效奖励', '系统补偿', '数据修正', '其他'];

  const openAdjustDialog = () => {
    setAdjustOpen(true);
    setAdjustType('add');
    setAdjustAmount('');
    setAdjustReason('');
    setAdjustNote('');
    setAdjustError('');
  };

  const handleAdjust = async () => {
    if (!adjustAmount || Number(adjustAmount) <= 0) { setAdjustError('请输入有效积分数'); return; }
    if (!adjustReason) { setAdjustError('请选择调整原因'); return; }
    setAdjustLoading(true);
    setAdjustError('');
    try {
      const amount = adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount);
      const remark = adjustNote ? `${adjustReason} - ${adjustNote}` : adjustReason;
      await adminApi.adjustPoints({ userId: uid, amount, remark });
      setAdjustOpen(false);
      fetchData();
      // Refresh balance
      adminApi.getBalances({ page: 1, size: 1000 }).then((r) => {
        const b = r.data.records.find((x) => x.userId === uid);
        if (b) setUserBalance(b.balance);
      }).catch(() => {});
    } catch (e: unknown) {
      setAdjustError(e instanceof Error ? e.message : '调整失败');
    } finally {
      setAdjustLoading(false);
    }
  };

  const adjustPreview = adjustAmount && Number(adjustAmount) > 0
    ? userBalance + (adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount))
    : null;

  const userName = user?.name || user?.username || `用户#${uid}`;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      {/* Adjust Dialog */}
      <Dialog open={adjustOpen} onClose={() => setAdjustOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 500 } }}>
        {/* Header */}
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <TollIcon sx={{ fontSize: 20, color: '#D97706' }} />
            </Box>
            <Box>
              <Typography sx={{ fontSize: 16, fontWeight: 700 }}>调整用户积分</Typography>
              <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>手动增加或扣减用户积分余额</Typography>
            </Box>
          </Box>
          <IconButton size="small" onClick={() => setAdjustOpen(false)} sx={{ width: 32, height: 32 }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, py: 2.5 }}>
          {adjustError && <Alert severity="error" sx={{ borderRadius: 2 }}>{adjustError}</Alert>}
          {/* User info card */}
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC', borderRadius: 2, px: 2, py: 1.75, border: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16 }}>{userName.charAt(0)}</Avatar>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{userName}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>工号: {user.employeeId}</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>当前积分余额</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>{userBalance.toLocaleString()}</Typography>
              </Box>
            </Box>
          )}
          {/* Type toggle */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 1 }}>调整类型 <Typography component="span" sx={{ color: 'error.main', fontSize: 13 }}>*</Typography></Typography>
            <Box sx={{ display: 'flex', gap: 1.5 }}>
              <Box onClick={() => setAdjustType('add')} sx={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, p: '12px 16px', borderRadius: 2, cursor: 'pointer',
                border: adjustType === 'add' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                bgcolor: adjustType === 'add' ? '#EFF6FF' : 'transparent',
              }}>
                <AddCircleOutlineIcon sx={{ fontSize: 20, color: adjustType === 'add' ? '#2563EB' : '#94A3B8' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: adjustType === 'add' ? '#2563EB' : 'text.primary' }}>增加积分</Typography>
              </Box>
              <Box onClick={() => setAdjustType('sub')} sx={{
                flex: 1, display: 'flex', alignItems: 'center', gap: 1.25, p: '12px 16px', borderRadius: 2, cursor: 'pointer',
                border: adjustType === 'sub' ? '2px solid #2563EB' : '1px solid #E2E8F0',
                bgcolor: adjustType === 'sub' ? '#EFF6FF' : 'transparent',
              }}>
                <RemoveCircleOutlineIcon sx={{ fontSize: 20, color: adjustType === 'sub' ? '#2563EB' : '#94A3B8' }} />
                <Typography sx={{ fontSize: 13, fontWeight: 500, color: adjustType === 'sub' ? '#2563EB' : 'text.primary' }}>扣减积分</Typography>
              </Box>
            </Box>
          </Box>
          {/* Amount */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>调整积分数 <Typography component="span" sx={{ color: 'error.main', fontSize: 13 }}>*</Typography></Typography>
            <TextField fullWidth size="small" type="number" placeholder="请输入积分数" value={adjustAmount} onChange={(e) => setAdjustAmount(e.target.value)}
              slotProps={{ input: { startAdornment: <InputAdornment position="start"><Typography sx={{ fontSize: 16, fontWeight: 600, color: adjustType === 'add' ? '#2563EB' : '#DC2626' }}>{adjustType === 'add' ? '+' : '-'}</Typography></InputAdornment> } }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            {adjustPreview !== null && (
              <Typography sx={{ fontSize: 12, color: 'text.secondary', mt: 0.75 }}>调整后余额：{adjustPreview.toLocaleString()} 积分</Typography>
            )}
          </Box>
          {/* Reason */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>调整原因 <Typography component="span" sx={{ color: 'error.main', fontSize: 13 }}>*</Typography></Typography>
            <Select fullWidth size="small" displayEmpty value={adjustReason} onChange={(e) => setAdjustReason(e.target.value)} sx={{ borderRadius: 2 }}>
              <MenuItem value="" disabled><Typography sx={{ color: 'text.disabled', fontSize: 13 }}>请选择</Typography></MenuItem>
              {REASON_OPTIONS.map((r) => <MenuItem key={r} value={r}>{r}</MenuItem>)}
            </Select>
          </Box>
          {/* Note */}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.75 }}>备注说明</Typography>
            <TextField fullWidth size="small" multiline rows={2} placeholder="请输入备注说明" value={adjustNote} onChange={(e) => setAdjustNote(e.target.value)}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', gap: 1.5 }}>
          <Button onClick={() => setAdjustOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>取消</Button>
          <Button variant="contained" startIcon={<CheckIcon />} disabled={adjustLoading} onClick={handleAdjust} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}>确认调整</Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Breadcrumbs sx={{ fontSize: 13, mb: 1 }}>
            <Link underline="hover" color="inherit" sx={{ cursor: 'pointer' }} onClick={() => navigate('/admin/users')}>用户管理</Link>
            <Typography sx={{ fontSize: 13, color: 'text.primary' }}>积分变动记录</Typography>
          </Breadcrumbs>
          <Typography sx={{ fontSize: 22, fontWeight: 700 }}>{userName} 的积分变动记录</Typography>
        </Box>
        <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
          {user && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, bgcolor: '#F8FAFC', borderRadius: 2, px: 2, py: 1, border: '1px solid #F1F5F9' }}>
              <Box sx={{ width: 32, height: 32, borderRadius: '50%', bgcolor: 'primary.main', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Typography sx={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{userName.charAt(0)}</Typography>
              </Box>
              <Box>
                <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>工号: {user.employeeId}</Typography>
              </Box>
            </Box>
          )}
          <Button variant="contained" startIcon={<TuneIcon />} onClick={openAdjustDialog} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13, fontWeight: 600 }}>调整积分</Button>
        </Box>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[
          { label: '累计获得', value: totalEarned.toLocaleString(), color: '#16A34A', sub: '历史总获得积分' },
          { label: '累计消耗', value: totalSpent.toLocaleString(), color: '#DC2626', sub: '历史总消耗积分' },
          { label: '手动调整', value: (adjustTotal >= 0 ? '+' : '') + adjustTotal.toLocaleString(), color: '#2563EB', sub: '管理员手动增减' },
          { label: '变动次数', value: total, color: '#1E40AF', sub: '总积分变动记录' },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #F1F5F9' }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 22, fontWeight: 700, color: s.color, mt: 0.5 }}>{s.value}</Typography>
            <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>{s.sub}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <Select size="small" value={typeFilter} onChange={(e) => { setTypeFilter(e.target.value); setPage(1); }} sx={{ minWidth: 120, borderRadius: 2, fontSize: 13 }}>
          <MenuItem value="ALL">全部类型</MenuItem>
          <MenuItem value="SALARY">月度发放</MenuItem>
          <MenuItem value="REWARD">奖励</MenuItem>
          <MenuItem value="DEDUCTION">兑换消耗</MenuItem>
          <MenuItem value="ADJUSTMENT">手动调整</MenuItem>
          <MenuItem value="ROLLBACK">回滚</MenuItem>
        </Select>
        <Box sx={{ flex: 1 }} />
        <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>共 {total} 条记录</Typography>
      </Box>

      {/* Table */}
      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 6 }}><CircularProgress /></Box>
        ) : (
          <>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 140 }}>变动时间</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>变动类型</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>变动积分</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>变动后余额</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>变动原因</TableCell>
                    <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>操作人</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 ? (
                    <TableRow><TableCell colSpan={6} align="center" sx={{ py: 4, color: 'text.secondary' }}>暂无记录</TableCell></TableRow>
                  ) : rows.map((r) => {
                    const info = getTypeInfo(r.type);
                    return (
                      <TableRow key={r.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                        <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{r.createdAt}</TableCell>
                        <TableCell><Chip label={info.label} size="small" sx={{ bgcolor: info.bg, color: info.color, fontSize: 11, height: 24, borderRadius: 3 }} /></TableCell>
                        <TableCell sx={{ fontSize: 13, fontWeight: 600, color: r.amount > 0 ? '#16A34A' : '#DC2626' }}>
                          {r.amount > 0 ? '+' : ''}{r.amount.toLocaleString()}
                        </TableCell>
                        <TableCell sx={{ fontSize: 13, fontWeight: 500 }}>{r.balanceAfter.toLocaleString()}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{r.remark || '-'}</TableCell>
                        <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{r.operatorId ? `管理员#${r.operatorId}` : '系统'}</TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
              <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>显示 {(page - 1) * 20 + 1}-{Math.min(page * 20, total)} 共 {total} 条记录</Typography>
              <Pagination count={totalPages} page={page} onChange={(_e, v) => setPage(v)} color="primary" size="small" />
            </Box>
          </>
        )}
      </Paper>
    </Box>
  );
}
