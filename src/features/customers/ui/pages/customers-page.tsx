import { useState } from 'react';
import { Link as RouterLink } from 'react-router';
import { useQuery } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Card,
  Link,
  Table,
  Stack,
  Alert,
  Button,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  TextField,
  InputAdornment,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { customersApi } from '../../api/customers-api';
import { PageHeader } from '@/shared/ui/page-header';
import { UpsertCustomerDialog } from '../components/upsert-customer-dialog';

const CustomersPage = () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [search, setSearch] = useState('');

  const { data, isLoading, isError } = useQuery({
    queryKey: ['customers', search],
    queryFn: () => customersApi.list(search || undefined),
  });

  return (
    <Box>
      <PageHeader
        title="Clientes"
        subtitle="Cliente unificado cross-application. Único por (email, país)."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Nuevo cliente
          </Button>
        }
      />

      <Card variant="outlined">
        <CardContent>
          <TextField
            placeholder="Buscar por email o nombre…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            size="small"
            sx={{ mb: 2, maxWidth: 360 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            fullWidth
          />

          {isError && <Alert severity="error">Error cargando clientes.</Alert>}
          {isLoading && (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!isLoading && data?.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Sin resultados.</Box>
          )}
          {!isLoading && data && data.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>País</TableCell>
                    <TableCell>Documento</TableCell>
                    <TableCell>Teléfono</TableCell>
                    <TableCell>Creado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((c) => (
                    <TableRow key={c.id} hover>
                      <TableCell>
                        <Link component={RouterLink} to={`/customers/${c.id}`} underline="hover">
                          {c.email}
                        </Link>
                      </TableCell>
                      <TableCell>{c.fullName}</TableCell>
                      <TableCell>{c.country}</TableCell>
                      <TableCell>
                        {c.identityType && c.identityValue
                          ? `${c.identityType.toUpperCase()}: ${c.identityValue}`
                          : '—'}
                      </TableCell>
                      <TableCell>{c.phone ?? '—'}</TableCell>
                      <TableCell>{new Date(c.createdAt).toLocaleDateString('es-VE')}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <UpsertCustomerDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
    </Box>
  );
};

export default CustomersPage;
