import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';
import HeadphonesIcon from '@mui/icons-material/Headphones';
import TollIcon from '@mui/icons-material/Toll';

/** Dialog - 下架确认 */
export default function ConfirmRemoveDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 440 } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9', py: 2.5, px: 3 }}>确认下架商品</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3, alignItems: 'center' }}>
        <Box sx={{ width: 56, height: 56, borderRadius: '50%', bgcolor: '#FEF3C7', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <WarningAmberIcon sx={{ fontSize: 28, color: '#D97706' }} />
        </Box>
        <Box sx={{ textAlign: 'center' }}>
          <Typography sx={{ fontSize: 15, fontWeight: 600, mb: 0.5 }}>确定要下架此商品吗？</Typography>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>下架后用户将无法在商城中看到此商品，但不会删除商品数据</Typography>
        </Box>
        <Box sx={{ width: '100%', bgcolor: '#F8FAFC', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 40, height: 40, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <HeadphonesIcon sx={{ fontSize: 20, color: '#2563EB' }} />
          </Box>
          <Box sx={{ flex: 1 }}>
            <Typography sx={{ fontSize: 13, fontWeight: 600 }}>Sony WH-1000XM5 降噪耳机</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <TollIcon sx={{ fontSize: 14, color: '#D97706' }} />
              <Typography sx={{ fontSize: 12, color: '#D97706', fontWeight: 500 }}>2,580 积分</Typography>
            </Box>
          </Box>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5 }}>取消</Button>
        <Button variant="contained" color="warning" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5, fontWeight: 600 }}>确认下架</Button>
      </DialogActions>
    </Dialog>
  );
}
