import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import Button from '@mui/material/Button';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';
import TollIcon from '@mui/icons-material/Toll';
import { pointsApi } from '../../../services/api';

export default function AdminPoints() {
  const { i18n } = useTranslation();
  const isZh = i18n.language?.startsWith('zh');

  const [addOpen, setAddOpen] = useState(false);
  const [deductOpen, setDeductOpen] = useState(false);
  const [form, setForm] = useState({ employeeId: '', amount: '', remark: '' });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  const resetForm = () => setForm({ employeeId: '', amount: '', remark: '' });

  const handleAdd = async () => {
    try {
      const res = (await pointsApi.adminAdd({
        employeeId: Number(form.employeeId),
        amount: Number(form.amount),
        remark: form.remark,
      })) as unknown as { code: number; message: string };
      if (res.code === 0) {
        setSnackbar({ open: true, message: isZh ? '发放成功' : 'Points added', severity: 'success' });
        setAddOpen(false);
        resetForm();
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '操作失败' : 'Operation failed', severity: 'error' });
    }
  };

  const handleDeduct = async () => {
    try {
      const res = (await pointsApi.adminDeduct({
        employeeId: Number(form.employeeId),
        amount: Number(form.amount),
        remark: form.remark,
      })) as unknown as { code: number; message: string };
      if (res.code === 0) {
        setSnackbar({ open: true, message: isZh ? '扣除成功' : 'Points deducted', severity: 'success' });
        setDeductOpen(false);
        resetForm();
      } else {
        setSnackbar({ open: true, message: res.message, severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: isZh ? '操作失败' : 'Operation failed', severity: 'error' });
    }
  };

  const formContent = (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: '8px' }}>
      <TextField
        label={isZh ? '员工 ID' : 'Employee ID'}
        value={form.employeeId}
        onChange={(e) => setForm({ ...form, employeeId: e.target.value })}
        type="number"
        fullWidth
        size="small"
      />
      <TextField
        label={isZh ? '积分数量' : 'Amount'}
        value={form.amount}
        onChange={(e) => setForm({ ...form, amount: e.target.value })}
        type="number"
        fullWidth
        size="small"
      />
      <TextField
        label={isZh ? '备注' : 'Remark'}
        value={form.remark}
        onChange={(e) => setForm({ ...form, remark: e.target.value })}
        fullWidth
        size="small"
        multiline
        rows={2}
      />
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: '32px' }}>
      <Typography sx={{ fontSize: 24, fontWeight: 700, color: 'text.primary' }}>
        {isZh ? '积分管理' : 'Points Management'}
      </Typography>

      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '20px' }}>
        {/* Add Points Card */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#F1F5F9',
            cursor: 'pointer',
            '&:hover': { boxShadow: 2 },
          }}
          onClick={() => {
            resetForm();
            setAddOpen(true);
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#DCFCE7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <AddCircleOutlineIcon sx={{ fontSize: 32, color: '#16A34A' }} />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary' }}>
            {isZh ? '发放积分' : 'Add Points'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
            {isZh ? '向员工账户发放积分奖励' : 'Add points to employee accounts'}
          </Typography>
        </Paper>

        {/* Deduct Points Card */}
        <Paper
          elevation={0}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 2,
            p: 4,
            borderRadius: 3,
            border: '1px solid',
            borderColor: '#F1F5F9',
            cursor: 'pointer',
            '&:hover': { boxShadow: 2 },
          }}
          onClick={() => {
            resetForm();
            setDeductOpen(true);
          }}
        >
          <Box
            sx={{
              width: 64,
              height: 64,
              borderRadius: '50%',
              bgcolor: '#FEE2E2',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <RemoveCircleOutlineIcon sx={{ fontSize: 32, color: '#DC2626' }} />
          </Box>
          <Typography sx={{ fontSize: 18, fontWeight: 600, color: 'text.primary' }}>
            {isZh ? '扣除积分' : 'Deduct Points'}
          </Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary', textAlign: 'center' }}>
            {isZh ? '从员工账户扣除积分' : 'Deduct points from employee accounts'}
          </Typography>
        </Paper>
      </Box>

      {/* Info Card */}
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
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 100%)',
        }}
      >
        <TollIcon sx={{ fontSize: 28, color: '#2563EB' }} />
        <Typography sx={{ fontSize: 14, color: '#1E40AF' }}>
          {isZh
            ? '积分操作会实时反映到员工账户。请确认操作无误后再提交。'
            : 'Points operations are reflected in employee accounts in real time. Please verify before submitting.'}
        </Typography>
      </Paper>

      {/* Add Dialog */}
      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isZh ? '发放积分' : 'Add Points'}</DialogTitle>
        <DialogContent>{formContent}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setAddOpen(false)} sx={{ textTransform: 'none' }}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
          <Button variant="contained" color="success" onClick={handleAdd} sx={{ textTransform: 'none' }}>
            {isZh ? '确认发放' : 'Confirm Add'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Deduct Dialog */}
      <Dialog open={deductOpen} onClose={() => setDeductOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{isZh ? '扣除积分' : 'Deduct Points'}</DialogTitle>
        <DialogContent>{formContent}</DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeductOpen(false)} sx={{ textTransform: 'none' }}>
            {isZh ? '取消' : 'Cancel'}
          </Button>
          <Button variant="contained" color="error" onClick={handleDeduct} sx={{ textTransform: 'none' }}>
            {isZh ? '确认扣除' : 'Confirm Deduct'}
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
