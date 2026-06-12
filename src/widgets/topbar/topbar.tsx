import MenuIcon from '@mui/icons-material/Menu';
import { AppBar, Box, IconButton, Toolbar, Typography } from '@mui/material';

import { UserMenu } from './user-menu';
import { SIDEBAR_WIDTH_PX } from '../sidebar';

type Props = {
  onMenuClick: () => void;
};

export const Topbar = ({ onMenuClick }: Props) => (
  <AppBar
    position="fixed"
    elevation={0}
    sx={{
      width: { xs: '100%', md: `calc(100% - ${SIDEBAR_WIDTH_PX}px)` },
      ml: { xs: 0, md: `${SIDEBAR_WIDTH_PX}px` },
      bgcolor: 'background.paper',
      color: 'text.primary',
      borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
      height: 60,
    }}
  >
    <Toolbar
      sx={{
        height: 60,
        minHeight: '60px !important',
        display: 'flex',
        justifyContent: 'space-between',
        px: { xs: 1.5, sm: 3 },
        gap: 1,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
        <IconButton
          aria-label="Abrir menú de navegación"
          onClick={onMenuClick}
          edge="start"
          sx={{ display: { md: 'none' }, color: 'text.primary' }}
        >
          <MenuIcon />
        </IconButton>
        <Typography
          variant="body2"
          color="text.disabled"
          fontWeight={500}
          noWrap
          sx={{ display: { xs: 'none', sm: 'block' } }}
        >
          Panel administrativo · CLI Payments
        </Typography>
        <Typography
          variant="subtitle2"
          fontWeight={700}
          noWrap
          sx={{ display: { xs: 'block', sm: 'none' } }}
        >
          CLI Payments
        </Typography>
      </Box>
      <Box sx={{ flexShrink: 0 }}>
        <UserMenu />
      </Box>
    </Toolbar>
  </AppBar>
);
