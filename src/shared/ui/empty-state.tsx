import { Box, Stack, Button, Typography, type SvgIconProps } from '@mui/material';
import type { SvgIconTypeMap } from '@mui/material';
import type { OverridableComponent } from '@mui/material/OverridableComponent';

type IconComponent = OverridableComponent<SvgIconTypeMap> & { muiName: string };

type EmptyStateProps = {
  icon?: IconComponent;
  title: string;
  description?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
};

export const EmptyState = ({ icon: Icon, title, description, action }: EmptyStateProps) => (
  <Stack
    alignItems="center"
    justifyContent="center"
    spacing={2}
    sx={{ py: 8, px: 4, textAlign: 'center' }}
  >
    {Icon && (
      <Box
        sx={{
          width: 56,
          height: 56,
          borderRadius: '50%',
          bgcolor: 'action.hover',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          mb: 0.5,
        }}
      >
        <Icon sx={{ fontSize: 28, color: 'text.disabled' }} />
      </Box>
    )}
    <Box>
      <Typography variant="subtitle1" fontWeight={600} color="text.primary">
        {title}
      </Typography>
      {description && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, maxWidth: 320 }}>
          {description}
        </Typography>
      )}
    </Box>
    {action && (
      <Button variant="contained" onClick={action.onClick} size="small">
        {action.label}
      </Button>
    )}
  </Stack>
);
