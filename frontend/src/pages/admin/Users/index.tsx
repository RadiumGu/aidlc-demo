import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import GroupIcon from '@mui/icons-material/Group';

export default function AdminUsers() {
  return (
    <Box sx={{ p: '24px 32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, mb: 3 }}>用户管理</Typography>
      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid #F1F5F9', textAlign: 'center' }}>
        <GroupIcon sx={{ fontSize: 48, color: '#94A3B8', mb: 2 }} />
        <Typography sx={{ fontSize: 16, color: '#64748B' }}>
          用户管理功能开发中，敬请期待...
        </Typography>
      </Paper>
    </Box>
  );
}
