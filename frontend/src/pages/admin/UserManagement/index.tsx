import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import Avatar from '@mui/material/Avatar';
import TextField from '@mui/material/TextField';
import InputAdornment from '@mui/material/InputAdornment';
import IconButton from '@mui/material/IconButton';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import SearchIcon from '@mui/icons-material/Search';
import EditIcon from '@mui/icons-material/Edit';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';
import HistoryIcon from '@mui/icons-material/History';
import PeopleIcon from '@mui/icons-material/People';
import PersonIcon from '@mui/icons-material/Person';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TollIcon from '@mui/icons-material/Toll';
import CloseIcon from '@mui/icons-material/Close';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import CheckIcon from '@mui/icons-material/Check';
import { adminApi } from '../../../services/admin';
import type { UserResponse } from '../../../types/api';

interface UserStats { total: number; monthNew: number }

interface EnrichedUser extends UserResponse {
  pointsBalance?: number;
  orderCount?: number;
}

const REASON_OPTIONS = ['活动补发', '绩效奖励', '系统补偿', '数据修正', '其他'];

export default function UserManagement() {
  const navigate = useNavigate();
  const [users, setUsers] = useState<EnrichedUser[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [editUser, setEditUser] = useState<UserResponse | null>(null);
  const [editName, setEditName] = useState('');
  const pageSize = 10;

  // Adjust points dialog
  const [adjustUser, setAdjustUser] = useState<EnrichedUser | null>(null);
  const [adjustType, setAdjustType] = useState<'add' | 'sub'>('add');
  const [adjustAmount, setAdjustAmount] = useState('');
  const [adjustReason, setAdjustReason] = useState('');
  const [adjustNote, setAdjustNote] = useState('');
  const [adjustError, setAdjustError] = useState('');
  const [adjustLoading, setAdjustLoading] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [userRes, balRes, orderRes] = await Promise.all([
        adminApi.getUsers({ page, size: pageSize, keyword: keyword || undefined }),
        adminApi.getBalances({ page: 1, size: 1000 }).catch(() => null),
        adminApi.getUserOrderCounts().catch(() => null),
      ]);
      const balMap = new Map<number, number>();
      if (balRes) balRes.data.records.forEach((b) => balMap.set(b.userId, b.balance));
      const orderMap: Record<string, number> = orderRes?.data || {};
      const enriched: EnrichedUser[] = userRes.data.records.map((u) => ({
        ...u,
        pointsBalance: balMap.get(u.id) ?? 0,
        orderCount: orderMap[String(u.id)] ?? 0,
      }));
      setUsers(enriched);
      setTotal(userRes.data.total);
    } finally {
      setLoading(false);
    }
  }, [page, keyword]);

  useEffect(() => { fetchData(); }, [fetchData]);
  useEffect(() => { adminApi.getUserStats().then((r) => setStats(r.data)); }, []);

  const totalPages = Math.ceil(total / pageSize);
  const filtered = roleFilter === 'ALL' ? users : users.filter((u) => u.role === roleFilter);
  const activeCount = users.filter((u) => u.status === 'ACTIVE').length;

  const handleToggleStatus = async (user: UserResponse) => {
    const newStatus = user.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
    await adminApi.updateUser(user.id, { status: newStatus });
    fetchData();
  };

  const handleEditSave = async () => {
    if (!editUser) return;
    await adminApi.updateUser(editUser.id, { name: editName });
    setEditUser(null);
    fetchData();
  };

  const openAdjust = (user: EnrichedUser) => {
    setAdjustUser(user);
    setAdjustType('add');
    setAdjustAmount('');
    setAdjustReason('');
    setAdjustNote('');
    setAdjustError('');
  };

  const handleAdjust = async () => {
    if (!adjustUser || !adjustAmount || Number(adjustAmount) <= 0) { setAdjustError('请输入有效积分数'); return; }
    if (!adjustReason) { setAdjustError('请选择调整原因'); return; }
    setAdjustLoading(true);
    setAdjustError('');
    try {
      const amount = adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount);
      const remark = adjustNote ? `${adjustReason} - ${adjustNote}` : adjustReason;
      await adminApi.adjustPoints({ userId: adjustUser.id, amount, remark });
      setAdjustUser(null);
      fetchData();
    } catch (e: unknown) {
      setAdjustError(e instanceof Error ? e.message : '调整失败');
    } finally {
      setAdjustLoading(false);
    }
  };

  const adjustPreview = adjustUser && adjustAmount && Number(adjustAmount) > 0
    ? (adjustUser.pointsBalance ?? 0) + (adjustType === 'add' ? Number(adjustAmount) : -Number(adjustAmount))
    : null;

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700 }}>用户管理</Typography>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[
          { label: '总用户数', value: stats?.total ?? '-', color: '#1E40AF', icon: <PeopleIcon sx={{ fontSize: 18, color: '#2563EB' }} />, bg: '#EFF6FF', sub: stats ? `较上月 +${stats.monthNew}` : '', subColor: '#16A34A' },
          { label: '活跃用户', value: activeCount || '-', color: '#2563EB', icon: <PersonIcon sx={{ fontSize: 18, color: '#10B981' }} />, bg: '#ECFDF5', sub: stats?.total ? `占比 ${((activeCount / (stats.total || 1)) * 100).toFixed(1)}%` : '', subColor: '#64748B' },
          { label: '本月新增', value: stats?.monthNew ?? '-', color: '#16A34A', icon: <TrendingUpIcon sx={{ fontSize: 18, color: '#16A34A' }} />, bg: '#F0FDF4', sub: '', subColor: '#16A34A' },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ flex: 1, p: 2, borderRadius: 3, border: '1px solid #F1F5F9' }}>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{s.label}</Typography>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: s.color, mt: 0.5 }}>{s.value}</Typography>
            {s.sub && <Typography sx={{ fontSize: 11, color: s.subColor }}>{s.sub}</Typography>}
          </Paper>
        ))}
      </Box>

      {/* Toolbar */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center' }}>
        <TextField size="small" placeholder="搜索用户名或工号..." value={keyword} onChange={(e) => setKeyword(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchData(); } }}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18 }} /></InputAdornment> } }}
          sx={{ width: 280, '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        <Select size="small" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} sx={{ minWidth: 120, borderRadius: 2, fontSize: 13 }}>
          <MenuItem value="ALL">全部角色</MenuItem>
          <MenuItem value="ADMIN">管理员</MenuItem>
          <MenuItem value="EMPLOYEE">员工</MenuItem>
        </Select>
        <Typography sx={{ fontSize: 13, color: 'text.secondary', flex: 1 }}>共 {total} 位用户</Typography>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>用户信息</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 130 }}>部门</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>积分余额</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 90 }}>兑换次数</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 110 }}>角色</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 80 }}>状态</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 140 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map((user) => (
                  <TableRow key={user.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' } }}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>{(user.name || user.username).charAt(0)}</Avatar>
                        <Box>
                          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>{user.name || user.username}</Typography>
                          <Typography sx={{ fontSize: 11, color: 'text.disabled' }}>工号: {user.employeeId}</Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{user.department || '-'}</TableCell>
                    <TableCell sx={{ fontSize: 13, fontWeight: 600, color: '#D97706' }}>{(user.pointsBalance ?? 0).toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: 13 }}>{user.orderCount ?? 0}</TableCell>
                    <TableCell>
                      <Chip label={user.role === 'ADMIN' ? '管理员' : '员工'} size="small"
                        sx={{ bgcolor: user.role === 'ADMIN' ? '#EDE9FE' : '#DBEAFE', color: user.role === 'ADMIN' ? '#7C3AED' : '#2563EB', fontSize: 11, height: 24, borderRadius: 3 }} />
                    </TableCell>
                    <TableCell>
                      <Chip label={user.status === 'ACTIVE' ? '正常' : '禁用'} size="small"
                        sx={{ bgcolor: user.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2', color: user.status === 'ACTIVE' ? '#16A34A' : '#991B1B', fontSize: 11, height: 24, borderRadius: 3 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 0.5 }}>
                        <IconButton size="small" onClick={() => { setEditUser(user); setEditName(user.name || ''); }} title="编辑"><EditIcon sx={{ fontSize: 18, color: '#64748B' }} /></IconButton>
                        <IconButton size="small" onClick={() => handleToggleStatus(user)} title={user.status === 'ACTIVE' ? '禁用' : '启用'}>
                          {user.status === 'ACTIVE' ? <BlockIcon sx={{ fontSize: 18, color: '#D97706' }} /> : <CheckCircleOutlineIcon sx={{ fontSize: 18, color: '#16A34A' }} />}
                        </IconButton>
                        <IconButton size="small" onClick={() => openAdjust(user)} title="调整积分"><TollIcon sx={{ fontSize: 18, color: '#D97706' }} /></IconButton>
                        <IconButton size="small" onClick={() => navigate(`/admin/users/${user.id}/points`)} title="积分历史"><HistoryIcon sx={{ fontSize: 18, color: '#64748B' }} /></IconButton>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      {totalPages > 1 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>显示 {(page - 1) * pageSize + 1}-{Math.min(page * pageSize, total)} 共 {total} 条</Typography>
          <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
        </Box>
      )}

      {/* Edit Dialog */}
      <Dialog open={!!editUser} onClose={() => setEditUser(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600 }}>编辑用户</Typography>
          <IconButton size="small" onClick={() => setEditUser(null)}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </Box>
        <DialogContent sx={{ pt: '16px !important' }}>
          <TextField fullWidth size="small" label="姓名" value={editName} onChange={(e) => setEditName(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setEditUser(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
          <Button variant="contained" onClick={handleEditSave} sx={{ borderRadius: 2, textTransform: 'none' }}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* Adjust Points Dialog */}
      <Dialog open={!!adjustUser} onClose={() => setAdjustUser(null)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 500 } }}>
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
          <IconButton size="small" onClick={() => setAdjustUser(null)} sx={{ width: 32, height: 32 }}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
        </Box>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, py: 2.5 }}>
          {adjustError && <Alert severity="error" sx={{ borderRadius: 2 }}>{adjustError}</Alert>}
          {/* User info card */}
          {adjustUser && (
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', bgcolor: '#F8FAFC', borderRadius: 2, px: 2, py: 1.75, border: '1px solid #F1F5F9' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ width: 40, height: 40, bgcolor: 'primary.main', fontSize: 16 }}>{(adjustUser.name || adjustUser.username).charAt(0)}</Avatar>
                <Box>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{adjustUser.name || adjustUser.username}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>工号: {adjustUser.employeeId} · {adjustUser.department || '未分配部门'}</Typography>
                </Box>
              </Box>
              <Box sx={{ textAlign: 'right' }}>
                <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>当前积分余额</Typography>
                <Typography sx={{ fontSize: 20, fontWeight: 700, color: '#D97706' }}>{(adjustUser.pointsBalance ?? 0).toLocaleString()}</Typography>
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
          <Button onClick={() => setAdjustUser(null)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>取消</Button>
          <Button variant="contained" startIcon={<CheckIcon />} disabled={adjustLoading} onClick={handleAdjust} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, px: 3 }}>确认调整</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
