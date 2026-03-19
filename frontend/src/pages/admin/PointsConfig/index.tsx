import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Alert from '@mui/material/Alert';
import SaveIcon from '@mui/icons-material/Save';
import { adminApi } from '../../../services/admin';

export default function PointsConfig() {
  const [amount, setAmount] = useState('');
  const [updatedAt, setUpdatedAt] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    adminApi.getPointsConfig().then((res) => {
      setAmount(String(res.data.amount));
      setUpdatedAt(res.data.updatedAt);
    });
  }, []);

  const handleSave = async () => {
    setLoading(true);
    setError('');
    setSuccess(false);
    try {
      const res = await adminApi.updatePointsConfig({ amount: Number(amount) });
      setUpdatedAt(res.data.updatedAt);
      setSuccess(true);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '保存失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700 }}>积分发放配置</Typography>
      <Typography sx={{ fontSize: 14, color: 'text.secondary' }}>配置每月自动发放给员工的积分数额</Typography>

      {success && <Alert severity="success" sx={{ borderRadius: 2 }}>保存成功</Alert>}
      {error && <Alert severity="error" sx={{ borderRadius: 2 }}>{error}</Alert>}

      <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #F1F5F9', p: 3, maxWidth: 480 }}>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>每月发放积分数额</Typography>
            <TextField fullWidth size="small" type="number" value={amount} onChange={(e) => setAmount(e.target.value)} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
          {updatedAt && <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>上次更新：{updatedAt}</Typography>}
          <Button variant="contained" startIcon={<SaveIcon />} disabled={loading} onClick={handleSave} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, alignSelf: 'flex-start' }}>
            保存配置
          </Button>
        </Box>
      </Paper>
    </Box>
  );
}
