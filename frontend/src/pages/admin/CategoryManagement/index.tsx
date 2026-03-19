import { useEffect, useState } from 'react';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Paper from '@mui/material/Paper';
import TextField from '@mui/material/TextField';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Chip from '@mui/material/Chip';
import InputAdornment from '@mui/material/InputAdornment';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import { productApi } from '../../../services/product';
import { adminApi } from '../../../services/admin';
import type { CategoryTreeNode } from '../../../types/api';

export default function CategoryManagement() {
  const [categories, setCategories] = useState<CategoryTreeNode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');

  // Dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'add' | 'edit' | 'addChild'>('add');
  const [editId, setEditId] = useState<number | null>(null);
  const [catName, setCatName] = useState('');
  const [catParentId, setCatParentId] = useState<number | ''>('');
  const [catSortOrder, setCatSortOrder] = useState('');
  const [dialogLoading, setDialogLoading] = useState(false);
  const [dialogError, setDialogError] = useState('');

  // Delete dialog
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [deleteName, setDeleteName] = useState('');
  const [deleteLoading, setDeleteLoading] = useState(false);

  // Expand state
  const [expanded, setExpanded] = useState<Set<number>>(new Set());
  const toggleExpand = (id: number) => setExpanded((prev) => {
    const next = new Set(prev);
    next.has(id) ? next.delete(id) : next.add(id);
    return next;
  });

  const fetchCategories = () => {
    setLoading(true);
    productApi.getCategoryTree()
      .then((res) => {
        setCategories(res.data);
        // Auto-expand all parent categories
        const parentIds = new Set<number>();
        res.data.forEach((c: CategoryTreeNode) => { if (c.children.length > 0) parentIds.add(c.id); });
        setExpanded(parentIds);
      })
      .catch(() => setError('加载分类失败'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchCategories, []);

  const flatAll = (nodes: CategoryTreeNode[]): CategoryTreeNode[] =>
    nodes.flatMap((n) => [n, ...flatAll(n.children)]);

  const handleAdd = () => {
    setDialogMode('add');
    setCatName(''); setCatParentId(''); setCatSortOrder('');
    setDialogError(''); setEditId(null); setDialogOpen(true);
  };

  const handleAddChild = (parentId: number) => {
    setDialogMode('addChild');
    setCatName(''); setCatParentId(parentId); setCatSortOrder('');
    setDialogError(''); setEditId(null); setDialogOpen(true);
  };

  const handleEdit = (cat: CategoryTreeNode) => {
    setDialogMode('edit');
    setCatName(cat.name); setCatSortOrder(String(cat.sortOrder));
    setCatParentId(''); setDialogError(''); setEditId(cat.id); setDialogOpen(true);
  };

  const handleToggleStatus = async (cat: CategoryTreeNode) => {
    const newStatus = cat.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
    try {
      await adminApi.updateCategory(cat.id, { status: newStatus });
      fetchCategories();
    } catch {
      setError('状态更新失败');
    }
  };

  const handleDialogSave = async () => {
    if (!catName.trim()) { setDialogError('请输入类目名称'); return; }
    setDialogLoading(true); setDialogError('');
    try {
      if (dialogMode === 'add' || dialogMode === 'addChild') {
        await adminApi.createCategory({
          name: catName.trim(),
          parentId: catParentId || null,
          sortOrder: catSortOrder ? Number(catSortOrder) : undefined,
        });
      } else if (editId) {
        await adminApi.updateCategory(editId, {
          name: catName.trim(),
          sortOrder: catSortOrder ? Number(catSortOrder) : undefined,
        });
      }
      setDialogOpen(false); fetchCategories();
    } catch (e: unknown) {
      setDialogError(e instanceof Error ? e.message : '操作失败');
    } finally { setDialogLoading(false); }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    setDeleteLoading(true);
    try {
      await adminApi.deleteCategory(deleteId);
      setDeleteOpen(false); fetchCategories();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : '删除失败');
    } finally { setDeleteLoading(false); }
  };

  // Filter categories
  const filterTree = (nodes: CategoryTreeNode[]): CategoryTreeNode[] => {
    return nodes.map((n) => {
      const filteredChildren = filterTree(n.children);
      const nameMatch = !search || n.name.toLowerCase().includes(search.toLowerCase());
      const statusMatch = !statusFilter || n.status === statusFilter;
      const childMatch = filteredChildren.length > 0;
      if ((nameMatch && statusMatch) || childMatch) {
        return { ...n, children: filteredChildren };
      }
      return null;
    }).filter(Boolean) as CategoryTreeNode[];
  };

  const filtered = filterTree(categories);
  const totalCount = flatAll(categories).length;

  const renderRow = (cat: CategoryTreeNode, depth: number): React.ReactNode[] => {
    const hasChildren = cat.children.length > 0;
    const isExpanded = expanded.has(cat.id);
    const isParent = depth === 0;
    const isInactive = cat.status === 'INACTIVE';

    const rows: React.ReactNode[] = [
      <Box
        key={cat.id}
        sx={{
          display: 'flex', alignItems: 'center', width: '100%',
          px: '20px', py: isParent ? '14px' : '12px',
          pl: isParent ? '20px' : '66px',
          bgcolor: isParent ? '#F8FAFC' : 'transparent',
          borderBottom: '1px solid #F1F5F9',
          opacity: isInactive ? 0.6 : 1,
        }}
      >
        {/* 类目名称 */}
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          {isParent && hasChildren && (
            <Box sx={{ cursor: 'pointer', display: 'flex' }} onClick={() => toggleExpand(cat.id)}>
              {isExpanded ? <ExpandMoreIcon sx={{ fontSize: 18, color: '#64748B' }} /> : <ChevronRightIcon sx={{ fontSize: 18, color: '#64748B' }} />}
            </Box>
          )}
          <Typography sx={{ fontSize: isParent ? 14 : 13, fontWeight: isParent ? 600 : 400, color: isInactive ? '#64748B' : '#1E293B' }}>
            {cat.name}
          </Typography>
        </Box>
        {/* 商品数量 */}
        <Box sx={{ width: 100 }}>
          <Typography sx={{ fontSize: 13, fontWeight: isParent ? 600 : 400, color: isInactive ? '#64748B' : '#1E293B' }}>
            {cat.productCount ?? 0}
          </Typography>
        </Box>
        {/* 排序权重 */}
        <Box sx={{ width: 100 }}>
          <Typography sx={{ fontSize: 13, color: isInactive ? '#64748B' : '#1E293B' }}>
            {cat.sortOrder}
          </Typography>
        </Box>
        {/* 状态 */}
        <Box sx={{ width: 90 }}>
          <Chip
            label={cat.status === 'ACTIVE' ? '启用' : '禁用'}
            size="small"
            sx={{
              fontSize: 11, fontWeight: 500, height: 24,
              bgcolor: cat.status === 'ACTIVE' ? '#DCFCE7' : '#FEE2E2',
              color: cat.status === 'ACTIVE' ? '#16A34A' : '#DC2626',
            }}
          />
        </Box>
        {/* 操作 */}
        <Box sx={{ width: 130, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Typography
            sx={{ fontSize: 12, fontWeight: 500, color: '#2563EB', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            onClick={() => handleEdit(cat)}
          >编辑</Typography>
          {isParent ? (
            <>
              <Typography
                sx={{ fontSize: 12, fontWeight: 500, color: '#2563EB', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
                onClick={() => handleAddChild(cat.id)}
              >添加子类</Typography>
              <Typography
                sx={{
                  fontSize: 12, fontWeight: 500, cursor: 'pointer', '&:hover': { textDecoration: 'underline' },
                  color: cat.status === 'ACTIVE' ? '#F59E0B' : '#10B981',
                }}
                onClick={() => handleToggleStatus(cat)}
              >{cat.status === 'ACTIVE' ? '禁用' : '启用'}</Typography>
            </>
          ) : (
            <Typography
              sx={{ fontSize: 12, fontWeight: 500, color: '#DC2626', cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
              onClick={() => { setDeleteId(cat.id); setDeleteName(cat.name); setDeleteOpen(true); }}
            >删除</Typography>
          )}
        </Box>
      </Box>,
    ];
    if (hasChildren && isExpanded) {
      cat.children.forEach((child) => rows.push(...renderRow(child, depth + 1)));
    }
    return rows;
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: '20px', p: '32px' }}>
      {/* Add/Edit Dialog */}
      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4, width: 480 } } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9', py: 2.5, px: 3 }}>
          {dialogMode === 'edit' ? '编辑类目' : dialogMode === 'addChild' ? '添加子类目' : '新增类目'}
        </DialogTitle>
        <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 2.5, pt: '24px !important', px: 3 }}>
          {dialogError && <Alert severity="error" sx={{ borderRadius: 2 }}>{dialogError}</Alert>}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>类目名称 <Typography component="span" sx={{ color: '#DC2626' }}>*</Typography></Typography>
            <TextField fullWidth size="small" value={catName} onChange={(e) => setCatName(e.target.value)} placeholder="请输入类目名称" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
          {dialogMode === 'add' && (
            <Box>
              <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>上级类目</Typography>
              <Select fullWidth size="small" value={catParentId} onChange={(e) => setCatParentId(e.target.value as number)} displayEmpty sx={{ borderRadius: 2 }}>
                <MenuItem value="">无（顶级类目）</MenuItem>
                {categories.map((c) => <MenuItem key={c.id} value={c.id}>{c.name}</MenuItem>)}
              </Select>
            </Box>
          )}
          <Box>
            <Typography sx={{ fontSize: 13, fontWeight: 500, mb: 0.5 }}>排序权重</Typography>
            <TextField fullWidth size="small" type="number" value={catSortOrder} onChange={(e) => setCatSortOrder(e.target.value)} placeholder="数字越小越靠前" sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9', gap: 1 }}>
          <Button onClick={() => setDialogOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none', px: 2.5 }}>取消</Button>
          <Button variant="contained" disabled={dialogLoading} onClick={handleDialogSave} sx={{ borderRadius: 2, textTransform: 'none', px: 2.5, fontWeight: 600 }}>
            {dialogMode === 'edit' ? '保存修改' : '创建类目'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth slotProps={{ paper: { sx: { borderRadius: 4 } } }}>
        <DialogTitle sx={{ fontSize: 16, fontWeight: 600, borderBottom: '1px solid #F1F5F9' }}>确认删除</DialogTitle>
        <DialogContent sx={{ pt: '24px !important' }}>
          <Typography sx={{ fontSize: 14 }}>确定要删除类目「{deleteName}」吗？</Typography>
        </DialogContent>
        <DialogActions sx={{ px: 3, py: 2, borderTop: '1px solid #F1F5F9' }}>
          <Button onClick={() => setDeleteOpen(false)} variant="outlined" sx={{ borderRadius: 2, textTransform: 'none' }}>取消</Button>
          <Button variant="contained" color="error" disabled={deleteLoading} onClick={handleDeleteConfirm} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>确认删除</Button>
        </DialogActions>
      </Dialog>

      {error && <Alert severity="error" sx={{ borderRadius: 2 }} onClose={() => setError('')}>{error}</Alert>}

      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography sx={{ fontSize: 24, fontWeight: 700 }}>类目管理</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAdd} sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>新增类目</Button>
      </Box>

      {/* Toolbar: Search + Filter + Count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
        <TextField
          size="small" placeholder="搜索类目名称..." value={search}
          onChange={(e) => setSearch(e.target.value)}
          slotProps={{ input: { startAdornment: <InputAdornment position="start"><SearchIcon sx={{ fontSize: 18, color: '#94A3B8' }} /></InputAdornment> } }}
          sx={{ width: 280, '& .MuiOutlinedInput-root': { borderRadius: 2, height: 40 } }}
        />
        <Select
          size="small" value={statusFilter} displayEmpty
          onChange={(e) => setStatusFilter(e.target.value)}
          sx={{ borderRadius: 2, height: 40, minWidth: 120 }}
        >
          <MenuItem value="">全部状态</MenuItem>
          <MenuItem value="ACTIVE">启用</MenuItem>
          <MenuItem value="INACTIVE">禁用</MenuItem>
        </Select>
        <Box sx={{ flex: 1 }}>
          <Typography sx={{ fontSize: 13, color: '#64748B' }}>共 {totalCount} 个类目</Typography>
        </Box>
      </Box>

      {/* Table */}
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}><CircularProgress /></Box>
      ) : (
        <Paper elevation={0} sx={{ borderRadius: 3, border: '1px solid #E2E8F0', overflow: 'hidden' }}>
          {/* Table Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: '20px', py: '14px', bgcolor: '#F8FAFC' }}>
            <Box sx={{ flex: 1 }}><Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>类目名称</Typography></Box>
            <Box sx={{ width: 100 }}><Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>商品数量</Typography></Box>
            <Box sx={{ width: 100 }}><Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>排序权重</Typography></Box>
            <Box sx={{ width: 90 }}><Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>状态</Typography></Box>
            <Box sx={{ width: 130 }}><Typography sx={{ fontSize: 12, fontWeight: 600, color: '#64748B' }}>操作</Typography></Box>
          </Box>
          {/* Table Body */}
          {filtered.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4, color: '#64748B' }}>暂无分类数据</Box>
          ) : filtered.map((cat) => renderRow(cat, 0))}
        </Paper>
      )}
    </Box>
  );
}
