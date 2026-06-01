import { Box, Chip, Typography } from '@mui/material';

import { PageHeader } from './page-header';

type Props = {
  title: string;
  subtitle?: string;
  phase: 'Fase 0' | 'Fase 1' | 'Fase 2' | 'Fase 3' | 'Fase 4';
  description: string;
};

export const PlaceholderPage = ({ title, subtitle, phase, description }: Props) => (
  <Box>
    <PageHeader title={title} subtitle={subtitle} actions={<Chip label={phase} color="primary" variant="outlined" />} />
    <Box
      sx={{
        p: 5,
        borderRadius: 2,
        border: (theme) => `1px dashed ${theme.palette.divider}`,
        bgcolor: 'background.paper',
      }}
    >
      <Typography variant="body1" color="text.secondary">
        {description}
      </Typography>
    </Box>
  </Box>
);
