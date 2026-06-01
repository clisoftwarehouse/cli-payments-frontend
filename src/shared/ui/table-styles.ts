import type { SxProps, Theme } from '@mui/material';

export const thSx: SxProps<Theme> = {
  fontWeight: 600,
  fontSize: 11,
  color: 'text.secondary',
  textTransform: 'uppercase',
  letterSpacing: '0.07em',
  py: 1.25,
  whiteSpace: 'nowrap',
};

export const filterBarSx: SxProps<Theme> = {
  px: 2.5,
  py: 1.75,
  borderBottom: (t) => `1px solid ${t.palette.divider}`,
  display: 'flex',
  alignItems: 'center',
  gap: 2,
  flexWrap: 'wrap',
};
