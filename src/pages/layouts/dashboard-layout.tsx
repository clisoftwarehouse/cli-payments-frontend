import { useState } from 'react';
import { Outlet } from 'react-router';

import { Box } from '@mui/material';

import { Topbar } from '@/widgets/topbar';
import { Sidebar, SIDEBAR_WIDTH_PX } from '@/widgets/sidebar';

const TOPBAR_HEIGHT = 60;

export const DashboardLayout = () => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <Box sx={{ display: 'flex', minHeight: '100dvh', bgcolor: 'background.default' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <Topbar onMenuClick={() => setMobileOpen(true)} />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // En móvil el sidebar es un drawer temporal → sin margen fijo.
          ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
          mt: `${TOPBAR_HEIGHT}px`,
          minHeight: `calc(100dvh - ${TOPBAR_HEIGHT}px)`,
          p: { xs: 1.5, sm: 3 },
          // Evita que tablas anchas desborden el viewport: el scroll vive dentro de cada Card.
          minWidth: 0,
          maxWidth: '100%',
          overflowX: 'hidden',
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};
