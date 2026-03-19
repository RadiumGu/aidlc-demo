import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';

/** Dialog - 调整库存 */
export default function AdjustStockDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 480 } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9', py: 2.5, px: 3 }}>调整库存</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
        <Box sx={{ bgcolor: '#F8FAFC', borderRadius: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>当前库存</Typography>
          <Typography sx={{ fontSize: 18, fontWeight: 700 }}>156 件</Typography>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>调整类型</Typography>
          <Select fullWidth size="small" defaultValue="add" sx={{ borderRadius: 2 }}>
            <MenuItem value="add">增加库存</MenuItem>
            <MenuItem value="reduce">减少库存</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>调整数量</Typography>
          <TextField fullWidth size="small" type="number" placeholder="请输入数量" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>调整原因</Typography>
          <TextField fullWidth size="small" multiline rows={3} placeholder="请输入调整原因" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
        <Box sx={{ bgcolor: '#EFF6FF', borderRadius: 2, p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>调整后库存</Typography>
          <Typography sx={{ fontSize: 16, fontWeight: 700, color: '#2563EB' }}>156 件</Typography>
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5 }}>取消</Button>
        <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5, fontWeight: 600 }}>确认调整</Button>
      </DialogActions>
    </Dialog>
  );
}
