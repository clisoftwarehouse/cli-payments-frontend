import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
  Switch,
  Button,
  Tooltip,
  TableRow,
  TableCell,
  TableHead,
  TableBody,
  IconButton,
  CardContent,
  TableContainer,
  CircularProgress,
} from '@mui/material';

import { productsApi, type ProductDto } from '../../api/products-api';
import { PageHeader } from '@/shared/ui/page-header';
import { CreateProductDialog } from '../components/create-product-dialog';

const KIND_LABEL: Record<string, string> = {
  subscription_plan: 'Suscripción',
  dev_project: 'Proyecto',
  audit: 'Auditoría',
  maintenance: 'Mantenimiento',
  addon: 'Addon',
  one_shot: 'One-shot',
};

const ProductsPage = () => {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<ProductDto | null>(null);
  const { data, isLoading, isError } = useQuery({ queryKey: ['products'], queryFn: () => productsApi.list() });

  const toggle = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      productsApi.update(id, { isActive }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['products'] }),
  });

  return (
    <Box>
      <PageHeader
        title="Productos"
        subtitle="Catálogo central. Planes de SaaS, paquetes de desarrollo, auditorías, mantenimientos, addons."
        actions={
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setDialogOpen(true)}>
            Nuevo producto
          </Button>
        }
      />

      <Card variant="outlined">
        <CardContent>
          {isError && <Alert severity="error">Error cargando productos.</Alert>}
          {isLoading && (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!isLoading && data?.length === 0 && (
            <Stack alignItems="center" spacing={1} sx={{ p: 4 }}>
              <Box sx={{ color: 'text.secondary' }}>Aún no hay productos.</Box>
              <Button onClick={() => setDialogOpen(true)} variant="outlined">
                Crear primer producto
              </Button>
            </Stack>
          )}
          {!isLoading && data && data.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>SKU</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Tipo</TableCell>
                    <TableCell>Precio</TableCell>
                    <TableCell>Ciclo</TableCell>
                    <TableCell>Activo</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.map((p) => (
                    <TableRow key={p.id} hover>
                      <TableCell>
                        <code>{p.sku}</code>
                      </TableCell>
                      <TableCell>{p.name}</TableCell>
                      <TableCell>
                        <Chip label={KIND_LABEL[p.kind] ?? p.kind} size="small" />
                      </TableCell>
                      <TableCell>
                        {Number(p.priceAmount).toLocaleString('es-VE', { minimumFractionDigits: 2 })} {p.priceCurrency}
                      </TableCell>
                      <TableCell>{p.billingInterval ?? '—'}</TableCell>
                      <TableCell>
                        <Switch
                          size="small"
                          checked={p.isActive}
                          disabled={toggle.isPending}
                          onChange={(_, v) => toggle.mutate({ id: p.id, isActive: v })}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => setEditing(p)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      <CreateProductDialog open={dialogOpen} onClose={() => setDialogOpen(false)} />
      {editing && (
        <CreateProductDialog open onClose={() => setEditing(null)} product={editing} />
      )}
    </Box>
  );
};

export default ProductsPage;
