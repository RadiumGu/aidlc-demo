import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Pagination from '@mui/material/Pagination';
import RuleIcon from '@mui/icons-material/Rule';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TollIcon from '@mui/icons-material/Toll';
import GroupIcon from '@mui/icons-material/Group';
import AddIcon from '@mui/icons-material/Add';
import { adminApi } from '../../../services/admin';
import type { DistributionConfigResponse } from '../../../types/api';

interface PointRule {
  id: number;
  name: string;
  description: string;
  type: string;
  typeLabel: string;
  typeBg: string;
  typeColor: string;
  amount: number;
  trigger: string;
  status: 'ACTIVE' | 'DISABLED';
}

const DEFAULT_RULES: PointRule[] = [
  { id: 1, name: '每月基础积分', description: '每月固定发放基础福利积分', type: 'FIXED', typeLabel: '固定发放', typeBg: '#EFF6FF', typeColor: '#2563EB', amount: 500, trigger: '每月1日自动发放', status: 'ACTIVE' },
  { id: 2, name: '入职周年奖励', description: '员工入职周年纪念积分奖励', type: 'EVENT', typeLabel: '事件触发', typeBg: '#F0FDF4', typeColor: '#16A34A', amount: 1000, trigger: '入职周年日自动触发', status: 'ACTIVE' },
  { id: 3, name: '生日祝福积分', description: '员工生日当天发放祝福积分', type: 'EVENT', typeLabel: '事件触发', typeBg: '#F0FDF4', typeColor: '#16A34A', amount: 200, trigger: '生日当天自动发放', status: 'ACTIVE' },
  { id: 4, name: '绩效优秀奖励', description: '季度绩效评估优秀员工额外奖励', type: 'MANUAL', typeLabel: '手动发放', typeBg: '#FFF7ED', typeColor: '#D97706', amount: 2000, trigger: '季度绩效评估后手动触发', status: 'ACTIVE' },
  { id: 5, name: '推荐入职奖励', description: '成功推荐新员工入职奖励积分', type: 'EVENT', typeLabel: '事件触发', typeBg: '#F0FDF4', typeColor: '#16A34A', amount: 500, trigger: '推荐员工转正后触发', status: 'ACTIVE' },
  { id: 6, name: '节日福利积分', description: '法定节假日额外福利积分', type: 'FIXED', typeLabel: '固定发放', typeBg: '#EFF6FF', typeColor: '#2563EB', amount: 300, trigger: '节假日前一天发放', status: 'DISABLED' },
];

export default function PointsRuleManagement() {
  const [rules, setRules] = useState<PointRule[]>(DEFAULT_RULES);
  const [, setConfig] = useState<DistributionConfigResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [editOpen, setEditOpen] = useState(false);
  const [editRule, setEditRule] = useState<PointRule | null>(null);
  const [editAmount, setEditAmount] = useState('');
  const [editError, setEditError] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [userTotal, setUserTotal] = useState<number | null>(null);
  const pageSize = 6;

  useEffect(() => {
    setLoading(true);
    adminApi.getPointsConfig()
      .then((r) => {
        setConfig(r.data);
        setRules((prev) => prev.map((rule) => rule.id === 1 ? { ...rule, amount: r.data.amount } : rule));
      })
      .finally(() => setLoading(false));
    adminApi.getUserStats().then((r) => setUserTotal(r.data.total)).catch(() => {});
  }, []);

  const activeCount = rules.filter((r) => r.status === 'ACTIVE').length;
  const totalAmount = rules.filter((r) => r.status === 'ACTIVE').reduce((s, r) => s + r.amount, 0);
  const totalPages = Math.ceil(rules.length / pageSize);
  const pagedRules = rules.slice((page - 1) * pageSize, page * pageSize);

  const handleToggleStatus = (id: number) => {
    setRules((prev) => prev.map((r) => r.id === id ? { ...r, status: r.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE' } : r));
  };

  const handleEditSave = async () => {
    if (!editRule || !editAmount || Number(editAmount) <= 0) { setEditError('请输入有效金额'); return; }
    setEditLoading(true);
    setEditError('');
    try {
      const newAmount = Number(editAmount);
      // If editing the monthly base rule (id=1), also update backend config
      if (editRule.id === 1) {
        const res = await adminApi.updatePointsConfig({ amount: newAmount });
        setConfig(res.data);
      }
      setRules((prev) => prev.map((r) => r.id === editRule.id ? { ...r, amount: newAmount } : r));
      setEditOpen(false);
      setEditRule(null);
    } catch (e: unknown) {
      setEditError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setEditLoading(false);
    }
  };

  const openEdit = (rule: PointRule) => {
    setEditRule(rule);
    setEditAmount(String(rule.amount));
    setEditError('');
    setEditOpen(true);
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '32px' }}>
      {/* Edit Rule Dialog */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4 } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9' }}>编辑规则 - {editRule?.name}</DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '24px !important' }}>
          {editError && <Alert severity="error" sx={{ borderRadius: 2 }}>{editError}</Alert>}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>积分值</Typography>
            <TextField fullWidth size="small" type="number" value={editAmount} onChange={(e) => setEditAmount(e.target.value)} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setEditOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
          <Button variant="contained" disabled={editLoading} onClick={handleEditSave} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>保存</Button>
        </DialogActions>
      </Dialog>

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography sx={{ fontSize: 24, fontWeight: 700 }}>积分规则管理</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', mt: 0.5 }}>配置员工积分发放规则，管理各类型积分策略</Typography>
        </Box>
        <Button variant="contained" startIcon={<AddIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontSize: 13, fontWeight: 600 }}>新增规则</Button>
      </Box>

      {/* Stat Cards */}
      <Box sx={{ display: 'flex', gap: 2 }}>
        {[
          { label: '规则总数', value: rules.length, icon: <RuleIcon sx={{ fontSize: 18, color: '#2563EB' }} />, bg: '#EFF6FF', color: '#1E40AF' },
          { label: '已启用', value: activeCount, icon: <CheckCircleIcon sx={{ fontSize: 18, color: '#10B981' }} />, bg: '#ECFDF5', color: '#10B981' },
          { label: '本月发放', value: totalAmount.toLocaleString(), icon: <TollIcon sx={{ fontSize: 18, color: '#F59E0B' }} />, bg: '#FFF7ED', color: '#1E40AF' },
          { label: '覆盖员工', value: userTotal ?? '-', icon: <GroupIcon sx={{ fontSize: 18, color: '#8B5CF6' }} />, bg: '#F5F3FF', color: '#1E40AF' },
        ].map((s) => (
          <Paper key={s.label} elevation={0} sx={{ flex: 1, p: '18px 20px', borderRadius: 3, border: '1px solid #F1F5F9' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
              <Box sx={{ width: 32, height: 32, borderRadius: 2, bgcolor: s.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{s.icon}</Box>
              <Typography sx={{ fontSize: 12, fontWeight: 500, color: 'text.secondary' }}>{s.label}</Typography>
            </Box>
            <Typography sx={{ fontSize: 28, fontWeight: 700, color: s.color }}>{s.value}</Typography>
          </Paper>
        ))}
      </Box>

      {/* Rules Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', overflow: 'hidden', flex: 1 }}>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow sx={{ bgcolor: '#F8FAFC' }}>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>规则名称</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>规则类型</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 100 }}>积分值</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 180 }}>触发条件</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 70 }}>状态</TableCell>
                  <TableCell sx={{ fontSize: 12, fontWeight: 600, color: 'text.secondary', width: 90 }}>操作</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {pagedRules.map((rule) => (
                  <TableRow key={rule.id} sx={{ '&:hover': { bgcolor: '#F8FAFC' }, opacity: rule.status === 'DISABLED' ? 0.6 : 1 }}>
                    <TableCell>
                      <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{rule.name}</Typography>
                      <Typography sx={{ fontSize: 11, color: 'text.secondary' }}>{rule.description}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip label={rule.typeLabel} size="small" sx={{ bgcolor: rule.typeBg, color: rule.typeColor, fontSize: 11, height: 22, borderRadius: 1 }} />
                    </TableCell>
                    <TableCell sx={{ fontSize: 14, fontWeight: 700 }}>{rule.amount.toLocaleString()}</TableCell>
                    <TableCell sx={{ fontSize: 12, color: 'text.secondary' }}>{rule.trigger}</TableCell>
                    <TableCell>
                      <Chip label={rule.status === 'ACTIVE' ? '启用' : '禁用'} size="small"
                        sx={{ bgcolor: rule.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2', color: rule.status === 'ACTIVE' ? '#16A34A' : '#991B1B', fontSize: 11, height: 24, borderRadius: 3 }} />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', gap: 1.5 }}>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#2563EB', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => openEdit(rule)}>编辑</Typography>
                        <Typography sx={{ fontSize: 12, fontWeight: 500, color: '#D97706', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                          onClick={() => handleToggleStatus(rule.id)}>{rule.status === 'ACTIVE' ? '禁用' : '启用'}</Typography>
                      </Box>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper>
      )}

      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>显示 1-{Math.min(pageSize, rules.length)} 共 {rules.length} 条规则</Typography>
        {totalPages > 1 && <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />}
      </Box>
    </Box>
  );
}
