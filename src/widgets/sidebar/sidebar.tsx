import { NavLink } from 'react-router';

import {
  Box,
  Chip,
  Stack,
  Drawer,
  Divider,
  ListItem,
  Typography,
  ListItemIcon,
  ListItemText,
  ListItemButton,
} from '@mui/material';

import { NAV_ITEMS, type NavItem } from './nav-items';

const SIDEBAR_WIDTH = 264;

type Group = { section: string; items: NavItem[] };

const groupBySection = (items: NavItem[]): Group[] => {
  const out: Group[] = [];
  for (const item of items) {
    const sec = item.section ?? '';
    const last = out[out.length - 1];
    if (last && last.section === sec) last.items.push(item);
    else out.push({ section: sec, items: [item] });
  }
  return out;
};

const NavRow = ({ item, onNavigate }: { item: NavItem; onNavigate?: () => void }) => {
  const Icon = item.icon;
  return (
    <ListItem disablePadding sx={{ mb: 0.375 }}>
      <ListItemButton
        component={NavLink}
        to={item.to}
        end={item.to === '/'}
        onClick={onNavigate}
        sx={{
          borderRadius: 1.5,
          px: 1.5,
          py: 0.75,
          minHeight: { xs: 44, md: 38 },
          color: 'text.secondary',
          transition: 'background 150ms ease, color 150ms ease',
          '&:hover': {
            bgcolor: 'action.hover',
            color: 'text.primary',
            '& .MuiListItemIcon-root': { color: 'text.primary' },
          },
          '&.active': {
            bgcolor: 'primary.lighter',
            color: 'primary.dark',
            '& .MuiListItemIcon-root': { color: 'primary.dark' },
            '& .MuiListItemText-primary': { fontWeight: 600 },
          },
        }}
      >
        <ListItemIcon sx={{ minWidth: 32, color: 'inherit' }}>
          <Icon fontSize="small" />
        </ListItemIcon>
        <ListItemText
          primary={item.label}
          primaryTypographyProps={{ fontSize: 13.5, fontWeight: 500, lineHeight: 1.4 }}
        />
        {item.badge && (
          <Chip
            label={item.badge}
            size="small"
            sx={{
              height: 18,
              fontSize: 10,
              fontWeight: 600,
              bgcolor: 'warning.lighter',
              color: 'warning.dark',
              ml: 0.5,
              '& .MuiChip-label': { px: 0.75 },
            }}
          />
        )}
      </ListItemButton>
    </ListItem>
  );
};

const SidebarContent = ({ onNavigate }: { onNavigate?: () => void }) => {
  const groups = groupBySection(NAV_ITEMS);

  return (
    <>
      {/* Brand */}
      <Stack
        direction="row"
        alignItems="center"
        spacing={1.5}
        sx={{
          px: 2.25,
          py: 2,
          borderBottom: (theme) => `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Box
          sx={{
            width: 34,
            height: 34,
            borderRadius: 1.5,
            background: (theme) =>
              `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
            boxShadow: (theme) => `0 2px 8px ${theme.palette.primary.main}40`,
          }}
        >
          <Typography
            sx={{ color: '#fff', fontWeight: 800, fontSize: 13, letterSpacing: '-0.5px', lineHeight: 1 }}
          >
            CP
          </Typography>
        </Box>
        <Box>
          <Typography variant="subtitle2" fontWeight={700} lineHeight={1.25} color="text.primary">
            CLI Payments
          </Typography>
          <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11, display: 'block' }}>
            Panel Admin
          </Typography>
        </Box>
      </Stack>

      {/* Navigation */}
      <Box sx={{ px: 1.5, py: 1.25, flex: 1, overflowY: 'auto' }}>
        {groups.map((group, idx) => (
          <Box key={group.section || idx}>
            {group.section ? (
              <Typography
                variant="overline"
                color="text.disabled"
                sx={{
                  display: 'block',
                  px: 1.5,
                  pt: idx === 0 ? 0.5 : 1.75,
                  pb: 0.5,
                  fontSize: 10,
                  letterSpacing: '0.1em',
                  fontWeight: 700,
                }}
              >
                {group.section}
              </Typography>
            ) : (
              idx > 0 && <Divider sx={{ my: 1.25 }} />
            )}
            {group.items.map((item) => (
              <NavRow key={item.to} item={item} onNavigate={onNavigate} />
            ))}
          </Box>
        ))}
      </Box>

      {/* Footer */}
      <Box
        sx={{
          px: 2.25,
          py: 1.25,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`,
          flexShrink: 0,
        }}
      >
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: 11 }}>
          © CLI Software House · Venezuela
        </Typography>
      </Box>
    </>
  );
};

type SidebarProps = {
  /** Drawer móvil abierto (solo aplica < md). */
  mobileOpen: boolean;
  onClose: () => void;
};

const paperSx = {
  width: SIDEBAR_WIDTH,
  bgcolor: 'background.paper',
  display: 'flex',
  flexDirection: 'column' as const,
  boxSizing: 'border-box' as const,
};

export const Sidebar = ({ mobileOpen, onClose }: SidebarProps) => (
  <>
    {/* Móvil: drawer temporal con scrim, se cierra al navegar */}
    <Drawer
      variant="temporary"
      open={mobileOpen}
      onClose={onClose}
      ModalProps={{ keepMounted: true }}
      sx={{ display: { xs: 'block', md: 'none' } }}
      PaperProps={{ sx: paperSx }}
    >
      <SidebarContent onNavigate={onClose} />
    </Drawer>

    {/* Desktop: drawer permanente */}
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          ...paperSx,
          borderRight: (theme) => `1px solid ${theme.palette.divider}`,
        },
      }}
    >
      <SidebarContent />
    </Drawer>
  </>
);

export const SIDEBAR_WIDTH_PX = SIDEBAR_WIDTH;
