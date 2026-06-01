import { Outlet } from 'react-router';

import { Box, Stack, Typography } from '@mui/material';

export const AuthLayout = () => (
  <Box
    sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      bgcolor: (theme) => theme.palette.grey[100],
      p: 2,
    }}
  >
    <Stack spacing={3} alignItems="center" sx={{ width: '100%', maxWidth: 420 }}>
      <Stack spacing={0.5} alignItems="center">
        <Typography variant="h5" fontWeight={700}>
          CLI Payments
        </Typography>
        <Typography variant="caption" color="text.secondary">
          CLI Software House — Panel administrativo
        </Typography>
      </Stack>
      <Outlet />
    </Stack>
  </Box>
);
