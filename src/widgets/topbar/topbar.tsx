import { AppBar, Box, Toolbar, Typography } from '@mui/material';

import { UserMenu } from './user-menu';
import { SIDEBAR_WIDTH_PX } from '../sidebar';

export const Topbar = () => (
  <AppBar
    position="fixed"
    elevation={0}
    sx={{
      width: `calc(100% - ${SIDEBAR_WIDTH_PX}px)`,
      ml: `${SIDEBAR_WIDTH_PX}px`,
      bgcolor: 'background.paper',
      color: 'text.primary',
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      height: 60,
    }}
  >
    <Toolbar sx={{ height: 60, minHeight: '60px !important', display: 'flex', justifyContent: 'space-between', px: { xs: 2, sm: 3 } }}>
      <Typography variant="body2" color="text.disabled" fontWeight={500}>
        Panel administrativo · CLI Payments
      </Typography>
      <Box>
        <UserMenu />
      </Box>
    </Toolbar>
  </AppBar>
);
