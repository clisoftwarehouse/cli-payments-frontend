import { Outlet } from 'react-router';

import { Box } from '@mui/material';

import { Topbar } from '@/widgets/topbar';
import { Sidebar, SIDEBAR_WIDTH_PX } from '@/widgets/sidebar';

const TOPBAR_HEIGHT = 60;

export const DashboardLayout = () => (
  <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
    <Sidebar />
    <Topbar />
    <Box
      component="main"
      sx={{
        flexGrow: 1,
        ml: `${SIDEBAR_WIDTH_PX}px`,
        mt: `${TOPBAR_HEIGHT}px`,
        minHeight: `calc(100vh - ${TOPBAR_HEIGHT}px)`,
        p: { xs: 2, sm: 3 },
        maxWidth: '100%',
      }}
    >
        <Outlet />
    </Box>
  </Box>
);
