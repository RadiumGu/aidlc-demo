import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Chip from '@mui/material/Chip';
import Pagination from '@mui/material/Pagination';
import CircularProgress from '@mui/material/CircularProgress';
import ShoppingBagIcon from '@mui/icons-material/ShoppingBag';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import InfoIcon from '@mui/icons-material/Info';
import HelpIcon from '@mui/icons-material/Help';
import WorkIcon from '@mui/icons-material/Work';
import MilitaryTechIcon from '@mui/icons-material/MilitaryTech';
import CelebrationIcon from '@mui/icons-material/Celebration';
import VolunteerActivismIcon from '@mui/icons-material/VolunteerActivism';
import StarsIcon from '@mui/icons-material/Stars';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import { usePointsStore } from '../../store/usePointsStore';

const TYPE_COLORS: Record<string, { bg: string; color: string }> = {
  EARN: { bg: '#DCFCE7', color: '#166534' },
  SPEND: { bg: '#FEF3C7', color: '#92400E' },
  ADJUST: { bg: '#DBEAFE', color: '#1E40AF' },
  SYSTEM: { bg: '#EFF6FF', color: '#1E40AF' },
};

export default function PointsCenter() {
  const navigate = useNavigate();
  const { balance, transactions, total, loading, fetchBalance, fetchTransactions } = usePointsStore();
  const [tab, setTab] = useState(0);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => { fetchBalance(); }, [fetchBalance]);
  useEffect(() => { fetchTransactions({ page, size: pageSize }); }, [fetchTransactions, page]);

  const filtered = tab === 0 ? transactions : tab === 1 ? transactions.filter((t) => t.amount > 0) : transactions.filter((t) => t.amount < 0);
  const totalPages = Math.ceil(total / pageSize);

  // Calculate stats from transactions
  const totalEarned = transactions.filter(t => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const totalSpent = transactions.filter(t => t.amount < 0).reduce((s, t) => s + Math.abs(t.amount), 0);
  const redeemCount = transactions.filter(t => t.amount < 0).length;

  const tabs = ['全部', '收入', '支出'];

  const quickActions = [
    { icon: <ShoppingBagIcon sx={{ fontSize: 22, color: '#2563EB' }} />, bg: '#EFF6FF', label: '积分商城', path: '/' },
    { icon: <ReceiptLongIcon sx={{ fontSize: 22, color: '#D97706' }} />, bg: '#FFFBEB', label: '兑换记录', path: '/orders' },
    { icon: <InfoIcon sx={{ fontSize: 22, color: '#16A34A' }} />, bg: '#DCFCE7', label: '积分规则', path: null },
    { icon: <HelpIcon sx={{ fontSize: 22, color: '#DC2626' }} />, bg: '#FEE2E2', label: '帮助中心', path: null },
  ];

  const earnRules = [
    { icon: <WorkIcon sx={{ fontSize: 20, color: '#2563EB' }} />, bg: '#EFF6FF', name: '工龄积分', desc: '每满一年工龄自动发放 1,000 积分', value: '+1,000/年' },
    { icon: <MilitaryTechIcon sx={{ fontSize: 20, color: '#D97706' }} />, bg: '#FFFBEB', name: '绩效奖励', desc: '季度绩效 A 级以上额外奖励积分', value: '+500~2,000' },
    { icon: <CelebrationIcon sx={{ fontSize: 20, color: '#16A34A' }} />, bg: '#DCFCE7', name: '节日福利', desc: '春节、中秋等节日发放福利积分', value: '+200~800' },
    { icon: <VolunteerActivismIcon sx={{ fontSize: 20, color: '#DC2626' }} />, bg: '#FEE2E2', name: '特别贡献', desc: '重大项目贡献、创新提案等专项奖励', value: '+500~5,000' },
  ];

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 4 }}>
      <Box sx={{ width: 960, display: 'flex', flexDirection: 'column', gap: 3 }}>
        {/* Points Hero Banner */}
        <Box sx={{ borderRadius: 3, background: 'linear-gradient(135deg, #1D4ED8 0%, #3B82F6 100%)', p: '32px 36px', color: '#fff' }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Typography sx={{ fontSize: 15, fontWeight: 500, color: '#BFDBFE' }}>我的可用积分</Typography>
              <Typography sx={{ fontSize: 48, fontWeight: 800 }}>{balance.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: 16, fontWeight: 500, color: '#BFDBFE' }}>积分</Typography>
            </Box>
            <Box sx={{ width: 64, height: 64, borderRadius: '50%', bgcolor: '#2563EB', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <StarsIcon sx={{ fontSize: 32, color: '#fff' }} />
            </Box>
          </Box>
          {/* Stats row */}
          <Box sx={{ display: 'flex', alignItems: 'center', mt: 3 }}>
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{totalEarned.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: 12, color: '#BFDBFE' }}>累计获得</Typography>
            </Box>
            <Box sx={{ width: 1, height: 36, bgcolor: '#3B82F6' }} />
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{totalSpent.toLocaleString()}</Typography>
              <Typography sx={{ fontSize: 12, color: '#BFDBFE' }}>累计使用</Typography>
            </Box>
            <Box sx={{ width: 1, height: 36, bgcolor: '#3B82F6' }} />
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography sx={{ fontSize: 20, fontWeight: 700 }}>{redeemCount}</Typography>
              <Typography sx={{ fontSize: 12, color: '#BFDBFE' }}>兑换次数</Typography>
            </Box>
          </Box>
        </Box>

        {/* Quick Actions */}
        <Box sx={{ display: 'flex', gap: 2 }}>
          {quickActions.map((a) => (
            <Paper key={a.label} elevation={0} onClick={() => a.path && navigate(a.path)}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px', py: '20px', borderRadius: 2, border: '1px solid #F1F5F9', cursor: a.path ? 'pointer' : 'default', '&:hover': a.path ? { boxShadow: 1 } : {} }}>
              <Box sx={{ width: 44, height: 44, borderRadius: '50%', bgcolor: a.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {a.icon}
              </Box>
              <Typography sx={{ fontSize: 13, fontWeight: 600 }}>{a.label}</Typography>
            </Paper>
          ))}
        </Box>

        {/* Earn Points Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Typography sx={{ fontSize: 16, fontWeight: 600, mb: 2 }}>积分获取途径</Typography>
          <Box sx={{ height: 1, bgcolor: 'divider', mb: 2 }} />
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            {earnRules.map((r) => (
              <Box key={r.name} sx={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: r.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {r.icon}
                </Box>
                <Box sx={{ flex: 1 }}>
                  <Typography sx={{ fontSize: 14, fontWeight: 600 }}>{r.name}</Typography>
                  <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>{r.desc}</Typography>
                </Box>
                <Typography sx={{ fontSize: 14, fontWeight: 700, color: '#16A34A' }}>{r.value}</Typography>
              </Box>
            ))}
          </Box>
        </Paper>

        {/* Points Detail Card */}
        <Paper elevation={0} sx={{ borderRadius: 2, border: '1px solid #F1F5F9', p: 3 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography sx={{ fontSize: 16, fontWeight: 600 }}>积分明细</Typography>
            <Box sx={{ display: 'flex', gap: 0.5 }}>
              {tabs.map((t, i) => (
                <Chip key={t} label={t} size="small" onClick={() => setTab(i)}
                  sx={{ borderRadius: 1, fontSize: 12, fontWeight: tab === i ? 600 : 500, bgcolor: tab === i ? '#2563EB' : 'transparent', color: tab === i ? '#fff' : 'text.secondary', '&:hover': { bgcolor: tab === i ? '#2563EB' : '#F1F5F9' } }} />
              ))}
            </Box>
          </Box>
          <Box sx={{ height: 1, bgcolor: 'divider', mb: 2 }} />

          {/* Table header */}
          <Box sx={{ display: 'flex', alignItems: 'center', pb: 1, mb: 1 }}>
            <Typography sx={{ width: '22%', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>时间</Typography>
            <Typography sx={{ flex: 1, fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>描述</Typography>
            <Typography sx={{ width: '10%', fontSize: 12, fontWeight: 600, color: 'text.secondary' }}>类型</Typography>
            <Typography sx={{ width: '12%', fontSize: 12, fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>积分变动</Typography>
            <Typography sx={{ width: '10%', fontSize: 12, fontWeight: 600, color: 'text.secondary', textAlign: 'right' }}>余额</Typography>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}><CircularProgress /></Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column' }}>
              {filtered.map((h) => {
                const tc = TYPE_COLORS[h.type] ?? { bg: '#F1F5F9', color: '#64748B' };
                return (
                  <Box key={h.id} sx={{ display: 'flex', alignItems: 'center', py: '10px', borderBottom: '1px solid', borderColor: 'divider' }}>
                    <Typography sx={{ width: '22%', fontSize: 13, color: 'text.secondary' }}>{h.createdAt}</Typography>
                    <Typography sx={{ flex: 1, fontSize: 13, fontWeight: 500 }}>{h.remark || '-'}</Typography>
                    <Box sx={{ width: '10%' }}>
                      <Chip label={h.type} size="small" sx={{ fontSize: 11, height: 22, bgcolor: tc.bg, color: tc.color, borderRadius: 1 }} />
                    </Box>
                    <Typography sx={{ width: '12%', fontSize: 13, fontWeight: 600, color: h.amount > 0 ? '#16A34A' : '#DC2626', textAlign: 'right' }}>
                      {h.amount > 0 ? '+' : ''}{h.amount.toLocaleString()}
                    </Typography>
                    <Typography sx={{ width: '10%', fontSize: 13, fontWeight: 500, textAlign: 'right' }}>{h.balanceAfter.toLocaleString()}</Typography>
                  </Box>
                );
              })}
              {filtered.length === 0 && (
                <Typography sx={{ textAlign: 'center', color: 'text.secondary', py: 4 }}>暂无记录</Typography>
              )}
            </Box>
          )}

          {totalPages > 1 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', pt: 2 }}>
              <Pagination count={totalPages} page={page} onChange={(_, v) => setPage(v)} color="primary" size="small" />
            </Box>
          )}
          {totalPages <= 1 && filtered.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 0.5, pt: 2, cursor: 'pointer' }}>
              <Typography sx={{ fontSize: 13, fontWeight: 500, color: '#2563EB' }}>查看更多记录</Typography>
              <KeyboardArrowDownIcon sx={{ fontSize: 18, color: '#2563EB' }} />
            </Box>
          )}
        </Paper>
      </Box>
    </Box>
  );
}
