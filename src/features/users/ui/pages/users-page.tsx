import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import {
  Box,
  Card,
  Chip,
  Table,
  Stack,
  Alert,
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

import { PageHeader } from '@/shared/ui/page-header';
import { usersApi, ROLE_ID, STATUS_ID, type UserDto } from '../../api/users-api';
import { UpsertUserDialog } from '../components/upsert-user-dialog';

const ROLE_LABEL: Record<number, string> = {
  [ROLE_ID.admin]: 'Admin',
  [ROLE_ID.user]: 'Usuario',
};

const UsersPage = () => {
  const queryClient = useQueryClient();
  const [createOpen, setCreateOpen] = useState(false);
  const [editing, setEditing] = useState<UserDto | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['users'],
    queryFn: () => usersApi.list(),
  });

  const remove = useMutation({
    mutationFn: (id: string | number) => usersApi.remove(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['users'] }),
  });

  return (
    <Box>
      <PageHeader
        title="Equipo admin"
        subtitle="Usuarios con acceso a este panel (rol admin requerido)."
        actions={
          <Button startIcon={<AddIcon />} variant="contained" onClick={() => setCreateOpen(true)}>
            Nuevo usuario
          </Button>
        }
      />

      <Card variant="outlined">
        <CardContent>
          {isError && <Alert severity="error">Error cargando usuarios.</Alert>}
          {isLoading && (
            <Stack alignItems="center" sx={{ p: 4 }}>
              <CircularProgress />
            </Stack>
          )}
          {!isLoading && data && data.data.length === 0 && (
            <Box sx={{ p: 4, textAlign: 'center', color: 'text.secondary' }}>Sin usuarios registrados.</Box>
          )}
          {!isLoading && data && data.data.length > 0 && (
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Email</TableCell>
                    <TableCell>Nombre</TableCell>
                    <TableCell>Rol</TableCell>
                    <TableCell>Estado</TableCell>
                    <TableCell>Proveedor</TableCell>
                    <TableCell>Creado</TableCell>
                    <TableCell align="right" />
                  </TableRow>
                </TableHead>
                <TableBody>
                  {data.data.map((u) => (
                    <TableRow key={u.id} hover>
                      <TableCell>{u.email ?? '—'}</TableCell>
                      <TableCell>
                        {[u.firstName, u.lastName].filter(Boolean).join(' ') || '—'}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.role ? ROLE_LABEL[u.role.id] ?? `id ${u.role.id}` : '—'}
                          size="small"
                          color={u.role?.id === ROLE_ID.admin ? 'primary' : 'default'}
                          variant="outlined"
                        />
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={u.status?.id === STATUS_ID.active ? 'Activo' : 'Inactivo'}
                          size="small"
                          color={u.status?.id === STATUS_ID.active ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell>{u.provider}</TableCell>
                      <TableCell>{new Date(u.createdAt).toLocaleDateString('es-VE')}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="Editar">
                          <IconButton size="small" onClick={() => setEditing(u)}>
                            <EditIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                        <Tooltip title="Eliminar">
                          <span>
                            <IconButton
                              size="small"
                              color="error"
                              disabled={remove.isPending}
                              onClick={() => {
                                if (confirm(`¿Eliminar ${u.email}? Esta acción es definitiva.`)) {
                                  remove.mutate(u.id);
                                }
                              }}
                            >
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </span>
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

      <UpsertUserDialog open={createOpen} onClose={() => setCreateOpen(false)} />
      {editing && <UpsertUserDialog open onClose={() => setEditing(null)} user={editing} />}
    </Box>
  );
};

export default UsersPage;
