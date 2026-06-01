import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

import SearchIcon from '@mui/icons-material/Search';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  TableRow,
  TextField,
  TableCell,
  TableHead,
  TableBody,
  CardContent,
  InputAdornment,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { PageHeader } from '@/shared/ui/page-header';
import { banksApi } from '../../api/banks-api';

const BanksPage = () => {
  const [search, setSearch] = useState('');
  const { data, isLoading, isError } = useQuery({ queryKey: ['banks'], queryFn: () => banksApi.list() });

  const filtered = data?.filter((b) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      b.name.toLowerCase().includes(q) ||
      (b.shortName ?? '').toLowerCase().includes(q) ||
      b.ibpCode.includes(q)
    );
  });

  return (
    <Box>
      <PageHeader
        title="Bancos"
        subtitle="Catálogo de referencia (códigos IBP de Venezuela). Usado en C2P / transferencias y como acquirer en merchant terminals."
      />

      <Card variant="outlined">
        <CardContent>
          <TextField
            placeholder="Buscar por nombre o código…"
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

          {isError && <Alert severity="error">Error cargando bancos.</Alert>}
          {isLoading && (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!isLoading && filtered && filtered.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Código IBP</TableCell>
                    <TableCell>Abrev.</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>C2P</TableCell>
                    <TableCell>Estado</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((b) => (
                    <TableRow key={b.id} hover>
                      <TableCell>
                        <code>{b.ibpCode}</code>
                      </TableCell>
                      <TableCell>{b.shortName ?? '—'}</TableCell>
                      <TableCell>{b.name}</TableCell>
                      <TableCell>{b.c2pEnabled ? 'Sí' : '—'}</TableCell>
                      <TableCell>
                        <Chip
                          label={b.isActive ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={b.isActive ? 'success' : 'default'}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
          {!isLoading && filtered && filtered.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Sin resultados.</Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default BanksPage;
