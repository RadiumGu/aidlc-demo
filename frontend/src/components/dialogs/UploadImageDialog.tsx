import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import ImageIcon from '@mui/icons-material/Image';
import DeleteIcon from '@mui/icons-material/Delete';
import IconButton from '@mui/material/IconButton';

/** Dialog - 上传图片 */
export default function UploadImageDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth PaperProps={{ sx: { borderRadius: 4, width: 560 } }}>
      <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9', py: 2.5, px: 3 }}>上传商品图片</DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
        {/* Drop zone */}
        <Box sx={{ height: 160, borderRadius: 3, bgcolor: '#EFF6FF', border: '2px dashed #2563EB', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 1.5, cursor: 'pointer' }}>
          <CloudUploadIcon sx={{ fontSize: 36, color: '#2563EB' }} />
          <Typography sx={{ fontSize: 14, fontWeight: 500, color: '#2563EB' }}>点击或拖拽上传图片</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>支持 JPG、PNG 格式，单张不超过 5MB</Typography>
        </Box>

        {/* Preview label */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography sx={{ fontSize: 13, fontWeight: 500 }}>已上传图片</Typography>
          <Typography sx={{ fontSize: 12, color: 'text.secondary' }}>3 / 10</Typography>
        </Box>

        {/* Preview grid */}
        <Box sx={{ display: 'flex', gap: 1.5 }}>
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ width: 96, height: 96, borderRadius: 2, bgcolor: '#F1F5F9', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
              <ImageIcon sx={{ fontSize: 32, color: '#94A3B8' }} />
              <IconButton size="small" sx={{ position: 'absolute', top: -8, right: -8, bgcolor: '#FEE2E2', width: 20, height: 20, '&:hover': { bgcolor: '#FECACA' } }}>
                <DeleteIcon sx={{ fontSize: 12, color: '#DC2626' }} />
              </IconButton>
            </Box>
          ))}
        </Box>
      </DialogContent>
      <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', justifyContent: 'flex-end', gap: 1 }}>
        <Button onClick={onClose} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5 }}>取消</Button>
        <Button variant="contained" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5, fontWeight: 600 }}>保存图片</Button>
      </DialogActions>
    </Dialog>
  );
}
