import { useRef, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import IconButton from '@mui/material/IconButton';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import ImageIcon from '@mui/icons-material/Image';
import { adminApi } from '../../services/admin';

interface ImageUploadProps {
  value?: string;
  onChange: (url: string) => void;
}

export default function ImageUpload({ value, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const handleSelect = () => inputRef.current?.click();

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      const res = await adminApi.uploadFile(file);
      onChange(res.data.url);
    } catch {
      setError('上传失败，请重试');
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  return (
    <Box data-testid="image-upload">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        style={{ display: 'none' }}
        onChange={handleFileChange}
        data-testid="image-upload-input"
      />
      {value ? (
        <Box sx={{ position: 'relative', width: 200, height: 200 }}>
          <Box
            component="img"
            src={value}
            alt="商品图片"
            sx={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 2, border: '1px solid #E2E8F0' }}
          />
          <Box sx={{ position: 'absolute', top: 4, right: 4, display: 'flex', gap: 0.5 }}>
            <IconButton
              size="small"
              onClick={handleSelect}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
              data-testid="image-upload-replace-btn"
            >
              <CloudUploadIcon sx={{ fontSize: 16 }} />
            </IconButton>
            <IconButton
              size="small"
              onClick={() => onChange('')}
              sx={{ bgcolor: 'rgba(255,255,255,0.9)', '&:hover': { bgcolor: '#fff' } }}
              data-testid="image-upload-delete-btn"
            >
              <DeleteIcon sx={{ fontSize: 16, color: '#DC2626' }} />
            </IconButton>
          </Box>
        </Box>
      ) : (
        <Box
          onClick={uploading ? undefined : handleSelect}
          sx={{
            width: 200, height: 200, borderRadius: 2,
            border: '2px dashed #CBD5E1', bgcolor: '#F8FAFC',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
            gap: 1, cursor: uploading ? 'default' : 'pointer',
            '&:hover': uploading ? {} : { borderColor: '#2563EB', bgcolor: '#EFF6FF' },
          }}
          data-testid="image-upload-dropzone"
        >
          {uploading ? (
            <CircularProgress size={24} />
          ) : (
            <>
              <ImageIcon sx={{ fontSize: 32, color: '#94A3B8' }} />
              <Typography sx={{ fontSize: 12, color: '#64748B' }}>点击上传图片</Typography>
              <Typography sx={{ fontSize: 11, color: '#94A3B8' }}>JPG, PNG, GIF, WebP</Typography>
            </>
          )}
        </Box>
      )}
      {error && <Typography sx={{ fontSize: 12, color: '#DC2626', mt: 0.5 }}>{error}</Typography>}
    </Box>
  );
}
