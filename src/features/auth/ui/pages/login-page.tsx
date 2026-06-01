import { Card, CardContent } from '@mui/material';

import { LoginForm } from '../components/login-form';

export const LoginPage = () => (
  <Card sx={{ maxWidth: 420, width: '100%', boxShadow: 4 }}>
    <CardContent sx={{ p: { xs: 3, md: 5 } }}>
      <LoginForm />
    </CardContent>
  </Card>
);
