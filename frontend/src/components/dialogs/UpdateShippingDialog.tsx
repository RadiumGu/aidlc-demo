import Dialog from '@mui/material/Dialog';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import IconButton from '@mui/material/IconButton';
import Chip from '@mui/material/Chip';
import CloseIcon from '@mui/icons-material/Close';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import CheckIcon from '@mui/icons-material/Check';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';

/** Dialog - 修改发货状态 */
export default function UpdateShippingDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 480 } }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 3, py: 2.5, borderBottom: '1px solid #F1F5F9' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Box sx={{ width: 36, height: 36, borderRadius: 2, bgcolor: '#DBEAFE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <LocalShippingIcon sx={{ fontSize: 20, color: '#2563EB' }} />
          </Box>
          <Box>
            <Typography sx={{ fontSize: 15, fontWeight: 600 }}>修改发货状态</Typography>
            <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>ORD-20260210-00158</Typography>
          </Box>
        </Box>
        <IconButton size="small" onClick={onClose}><CloseIcon sx={{ fontSize: 20 }} /></IconButton>
      </Box>

      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, px: 3, py: 2.5 }}>
        {/* Current status */}
        <Box sx={{ bgcolor: '#FFF7ED', borderRadius: 2, p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography sx={{ fontSize: 13, color: 'text.secondary' }}>当前状态</Typography>
          <Chip label="待发货" size="small" variant="outlined" sx={{ borderColor: '#D97706', color: '#D97706', fontSize: 11 }} />
          <ArrowForwardIcon sx={{ fontSize: 18, color: '#94A3B8' }} />
        </Box>

        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>新状态 <Typography component="span" sx={{ color: '#DC2626' }}>*</Typography></Typography>
          <Select fullWidth size="small" defaultValue="shipped" sx={{ borderRadius: 2 }}>
            <MenuItem value="shipped">已发货</MenuItem>
            <MenuItem value="delivered">已送达</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>物流公司</Typography>
          <Select fullWidth size="small" defaultValue="" displayEmpty sx={{ borderRadius: 2 }}>
            <MenuItem value="" disabled>请选择物流公司</MenuItem>
            <MenuItem value="sf">顺丰速运</MenuItem>
            <MenuItem value="jd">京东物流</MenuItem>
            <MenuItem value="zt">中通快递</MenuItem>
          </Select>
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>物流单号</Typography>
          <TextField fullWidth size="small" placeholder="请输入物流单号" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
        <Box>
          <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>备注说明</Typography>
          <TextField fullWidth size="small" multiline rows={3} placeholder="请输入备注" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', gap: 1.5 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 3 }}>取消</Button>
        <Button variant="contained" startIcon={<CheckIcon />} sx={{ borderRadius: 2, textTransform: 'none', px: 3, fontWeight: 600 }}>确认修改</Button>
      </DialogActions>
    </Dialog>
  );
}
