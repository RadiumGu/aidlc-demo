import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import IconButton from '@mui/material/IconButton';
import ErrorIcon from '@mui/icons-material/Error';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import CloseIcon from '@mui/icons-material/Close';
import DevicesIcon from '@mui/icons-material/Devices';

/** Dialog - 删除类目确认 */
export default function DeleteCategoryDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 480 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: '50%', bgcolor: '#FEE2E2', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DeleteForeverIcon sx={{ fontSize: 20, color: '#DC2626' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>删除类目</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>此操作不可撤销</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
      </Box>

      <Box sx={{ height: 1, bgcolor: '#F1F5F9' }} />

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, py: 2.5 }}>
        {/* Warning */}
        <Box sx={{ bgcolor: '#FEF2F2', borderRadius: 2, border: '1px solid #FECACA', p: 1.75, display: 'flex', gap: 1.25 }}>
          <ErrorIcon sx={{ fontSize: 18, color: '#DC2626', mt: 0.25 }} />
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 600, color: '#DC2626' }}>警告：此操作不可恢复</Typography>
            <Typography sx={{ fontSize: 12, color: '#991B1B' }}>删除类目后，该类目下的所有子类目也将被删除，关联的商品将变为未分类状态。</Typography>
          </Box>
        </Box>

        {/* Category info */}
        <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #F1F5F9', p: 2, display: 'flex', alignItems: 'center', gap: 1.75 }}>
          <Box sx={{ width: 44, height: 44, borderRadius: '10px', bgcolor: '#EFF6FF', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <DevicesIcon sx={{ fontSize: 22, color: '#2563EB' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 14, fontWeight: 600 }}>数码电子</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>包含 3 个子类目 · 38 件商品</Typography>
          </Box>
        </Box>

        {/* Confirm input */}
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>请输入 <Typography component="span" sx={{ fontWeight: 700, color: '#DC2626' }}>数码电子</Typography> 确认删除</Typography>
          <TextField fullWidth size="small" placeholder="请输入类目名称以确认" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>

      <Box sx={{ height: 1, bgcolor: '#F1F5F9' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.25, px: 3, py: 2 }}>
        <Button fullWidth variant="contained" disabled startIcon={<DeleteForeverIcon />} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600, bgcolor: '#FEE2E2', color: '#DC2626', '&.Mui-disabled': { bgcolor: '#FEE2E2', color: '#DC262680' } }}>确认删除</Button>
        <Button fullWidth variant="outlined" onClick={onClose} sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
      </Box>
    </Dialog>
  );
}
