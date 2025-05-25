import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Tooltip,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { useState } from 'react';

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  preferences?: string;
}

interface GuestCreate {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  address?: string;
  id_type?: string;
  id_number?: string;
  preferences?: string;
}

function Guests() {
  const [open, setOpen] = useState(false);
  const [editingGuest, setEditingGuest] = useState<Guest | null>(null);
  const [formData, setFormData] = useState<GuestCreate>({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    address: '',
    id_type: '',
    id_number: '',
    preferences: '',
  });

  const queryClient = useQueryClient();

  const { data: guests, isLoading, error } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      try {
        console.log('Fetching guests...');
        const response = await client.get('/guests');
        console.log('Guests response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error fetching guests:', error);
        throw error;
      }
    },
  });

  const createGuest = useMutation({
    mutationFn: async (newGuest: GuestCreate) => {
      try {
        console.log('Creating guest:', newGuest);
        const response = await client.post('/guests', newGuest);
        console.log('Create guest response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error creating guest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateGuest = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<GuestCreate> }) => {
      try {
        console.log('Updating guest:', { id, data });
        const response = await client.put(`/guests/${id}`, data);
        console.log('Update guest response:', response.data);
        return response.data;
      } catch (error) {
        console.error('Error updating guest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
      setOpen(false);
      setEditingGuest(null);
      resetForm();
    },
  });

  const deleteGuest = useMutation({
    mutationFn: async (id: number) => {
      try {
        console.log('Deleting guest:', id);
        await client.delete(`/guests/${id}`);
        console.log('Guest deleted successfully');
      } catch (error) {
        console.error('Error deleting guest:', error);
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['guests'] });
    },
  });

  const resetForm = () => {
    setFormData({
      first_name: '',
      last_name: '',
      email: '',
      phone: '',
      address: '',
      id_type: '',
      id_number: '',
      preferences: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingGuest) {
      updateGuest.mutate({ id: editingGuest.id, data: formData });
    } else {
      createGuest.mutate(formData);
    }
  };

  const handleEdit = (guest: Guest) => {
    setEditingGuest(guest);
    setFormData({
      first_name: guest.first_name,
      last_name: guest.last_name,
      email: guest.email,
      phone: guest.phone,
      address: guest.address || '',
      id_type: guest.id_type || '',
      id_number: guest.id_number || '',
      preferences: guest.preferences || '',
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этого гостя?')) {
      deleteGuest.mutate(id);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setEditingGuest(null);
    resetForm();
  };

  if (isLoading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    console.error('Error in Guests component:', error);
    return (
      <Box>
        <Typography color="error" variant="h6">Ошибка загрузки гостей</Typography>
        <Typography color="error">{error instanceof Error ? error.message : 'Неизвестная ошибка'}</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Гости</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Добавить гостя
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Имя</TableCell>
              <TableCell>Фамилия</TableCell>
              <TableCell>Email</TableCell>
              <TableCell>Телефон</TableCell>
              <TableCell>Адрес</TableCell>
              <TableCell>Тип документа</TableCell>
              <TableCell>Номер документа</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {guests?.map((guest) => (
              <TableRow key={guest.id}>
                <TableCell>{guest.first_name}</TableCell>
                <TableCell>{guest.last_name}</TableCell>
                <TableCell>{guest.email}</TableCell>
                <TableCell>{guest.phone}</TableCell>
                <TableCell>{guest.address || '-'}</TableCell>
                <TableCell>{guest.id_type || '-'}</TableCell>
                <TableCell>{guest.id_number || '-'}</TableCell>
                <TableCell>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleEdit(guest)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => handleDelete(guest.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingGuest ? 'Редактировать гостя' : 'Новый гость'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <TextField
                fullWidth
                label="Имя"
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Фамилия"
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Телефон"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
              />
              <TextField
                fullWidth
                label="Адрес"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Тип документа"
                name="id_type"
                value={formData.id_type}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Номер документа"
                name="id_number"
                value={formData.id_number}
                onChange={handleChange}
              />
              <TextField
                fullWidth
                label="Предпочтения"
                name="preferences"
                value={formData.preferences}
                onChange={handleChange}
                multiline
                rows={4}
              />
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createGuest.isPending || updateGuest.isPending}
          >
            {editingGuest ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Guests; 