import { useState } from 'react';
import { useNavigate } from 'react-router';

import LogoutIcon from '@mui/icons-material/Logout';
import { Menu, Avatar, MenuItem, IconButton, Typography, ListItemIcon } from '@mui/material';

import { useAuthStore } from '@/features/auth/model/auth-store';

export const UserMenu = () => {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const clear = useAuthStore((s) => s.clear);

  const [anchorEl, setAnchorEl] = useState<HTMLElement | null>(null);

  const handleLogout = () => {
    clear();
    navigate('/auth/login');
  };

  const initials = (() => {
    if (!user) return 'CL';
    const a = user.firstName?.[0] ?? user.email?.[0] ?? '?';
    const b = user.lastName?.[0] ?? '';
    return (a + b).toUpperCase();
  })();

  return (
    <>
      <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} size="small">
        <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', fontSize: 14 }}>{initials}</Avatar>
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
        slotProps={{ paper: { sx: { minWidth: 220 } } }}
      >
        <MenuItem disabled sx={{ opacity: 1, py: 1.25 }}>
          <div>
            <Typography variant="subtitle2">
              {user?.firstName ?? 'Usuario'} {user?.lastName ?? ''}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {user?.email ?? '—'}
            </Typography>
          </div>
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Cerrar sesión
        </MenuItem>
      </Menu>
    </>
  );
};
