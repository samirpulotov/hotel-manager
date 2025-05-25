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
  Chip,
  IconButton,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { tariffApi } from '../api/tariff';
import type { Room, RoomCreate, RoomUpdate, RoomType } from '../types/room';
import type { RoomTariff } from '../types/tariff';
import { useState } from 'react';

function Rooms() {
  const [open, setOpen] = useState(false);
  const [editingRoom, setEditingRoom] = useState<Room | null>(null);
  const [formData, setFormData] = useState<RoomCreate>({
    number: '',
    type: 'GUEST_HOUSE',
    floor: 1,
    capacity: 1,
    price_per_night: 0,
    description: '',
    amenities: '',
  });

  const queryClient = useQueryClient();

  const { data: rooms, isLoading, error } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await client.get('/rooms');
      return response.data;
    },
  });

  const { data: tariffs } = useQuery<Record<string, RoomTariff>>({
    queryKey: ['current-tariffs'],
    queryFn: async () => {
      const roomTypes = ['STANDARD', 'DELUXE', 'SUITE', 'FAMILY'];
      const tariffs: Record<string, RoomTariff> = {};
      
      for (const type of roomTypes) {
        try {
          const tariff = await tariffApi.getCurrentTariff(type);
          tariffs[type] = tariff;
        } catch (error) {
          console.error(`Failed to fetch tariff for ${type}:`, error);
        }
      }
      
      return tariffs;
    },
  });

  const createRoom = useMutation({
    mutationFn: async (newRoom: RoomCreate) => {
      const response = await client.post('/rooms', newRoom);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateRoom = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: RoomUpdate }) => {
      const response = await client.put(`/rooms/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
      setOpen(false);
      setEditingRoom(null);
      resetForm();
    },
  });

  const deleteRoom = useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/rooms/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['rooms'] });
    },
  });

  const resetForm = () => {
    setFormData({
      number: '',
      type: 'GUEST_HOUSE',
      floor: 1,
      capacity: 1,
      price_per_night: 0,
      description: '',
      amenities: '',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingRoom) {
      updateRoom.mutate({ id: editingRoom.id, data: formData });
    } else {
      createRoom.mutate(formData);
    }
  };

  const handleEdit = (room: Room) => {
    setEditingRoom(room);
    setFormData({
      number: room.number,
      type: room.type,
      floor: room.floor,
      capacity: room.capacity,
      price_per_night: room.price_per_night,
      description: room.description || '',
      amenities: room.amenities || '',
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот номер?')) {
      deleteRoom.mutate(id);
    }
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement> | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClose = () => {
    setOpen(false);
    setEditingRoom(null);
    resetForm();
  };

  const getRoomTypeLabel = (type: RoomType) => {
    switch (type) {
      case 'GUEST_HOUSE':
        return 'Гостевой Дом';
      case 'FRAME':
        return 'А-Фреймы';
      default:
        return type;
    }
  };

  const getCurrentPrice = (roomType: RoomType) => {
    const tariff = tariffs?.[roomType];
    return tariff ? tariff.price_per_night : 'Нет тарифа';
  };

  if (isLoading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки номеров</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Номера</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Добавить номер
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Номер</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Этаж</TableCell>
              <TableCell>Вместимость</TableCell>
              <TableCell>Цена/ночь</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rooms?.map((room) => (
              <TableRow key={room.id}>
                <TableCell>{room.number}</TableCell>
                <TableCell>{getRoomTypeLabel(room.type)}</TableCell>
                <TableCell>{room.floor}</TableCell>
                <TableCell>{room.capacity}</TableCell>
                <TableCell>
                  {typeof getCurrentPrice(room.type) === 'number' 
                    ? `${getCurrentPrice(room.type)} ₽`
                    : getCurrentPrice(room.type)}
                </TableCell>
                <TableCell>
                  <Chip
                    label={room.is_available ? 'Доступен' : 'Занят'}
                    color={room.is_available ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleEdit(room)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => handleDelete(room.id)}>
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
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingRoom ? 'Редактировать номер' : 'Добавить новый номер'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <TextField
                name="number"
                label="Номер"
                value={formData.number}
                onChange={handleChange}
                required
                fullWidth
              />
              <FormControl fullWidth>
                <InputLabel>Тип номера</InputLabel>
                <Select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  label="Тип номера"
                  required
                >
                  <MenuItem value="GUEST_HOUSE">Гостевой Дом</MenuItem>
                  <MenuItem value="FRAME">А-Фреймы</MenuItem>
                </Select>
              </FormControl>
              <TextField
                name="floor"
                label="Этаж"
                type="number"
                value={formData.floor}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="capacity"
                label="Вместимость"
                type="number"
                value={formData.capacity}
                onChange={handleChange}
                required
                fullWidth
              />
              <TextField
                name="description"
                label="Описание"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
              <TextField
                name="amenities"
                label="Удобства"
                value={formData.amenities}
                onChange={handleChange}
                multiline
                rows={2}
                fullWidth
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleClose}>Отмена</Button>
            <Button type="submit" variant="contained" color="primary">
              {editingRoom ? 'Сохранить' : 'Добавить номер'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Rooms; 