import { Box, Divider, Stack, Typography } from '@mui/material';

type Props = {
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  actions?: React.ReactNode;
};

export const PageHeader = ({ title, subtitle, actions }: Props) => (
  <Box sx={{ mb: { xs: 2, sm: 3 } }}>
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'stretch', sm: 'flex-start' }}
      spacing={{ xs: 1.5, sm: 2 }}
    >
      <Box sx={{ minWidth: 0 }}>
        <Typography variant="h5" fontWeight={700} component="div" lineHeight={1.3}>
          {title}
        </Typography>
        {subtitle && (
          <Typography
            variant="body2"
            color="text.secondary"
            component="div"
            sx={{ mt: 0.5, lineHeight: 1.5 }}
          >
            {subtitle}
          </Typography>
        )}
      </Box>
      {actions && (
        <Stack
          direction="row"
          spacing={1}
          flexShrink={0}
          alignItems="center"
          sx={{ '& > *': { flex: { xs: 1, sm: 'initial' } } }}
        >
          {actions}
        </Stack>
      )}
    </Stack>
    <Divider sx={{ mt: 2 }} />
  </Box>
);
