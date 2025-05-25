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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  InputAdornment,
  Tooltip,
  Autocomplete,
} from '@mui/material';
import { Edit as EditIcon, Delete as DeleteIcon, Check as CheckIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import client from '../api/client';
import { useState } from 'react';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { ru } from 'date-fns/locale';
import { format } from 'date-fns';

interface Booking {
  id: number;
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  status: 'pending' | 'confirmed' | 'checked_in' | 'checked_out' | 'cancelled';
  total_price: number;
  special_requests?: string;
  payment_status: string;
  guest: {
    first_name: string;
    last_name: string;
  };
  room: {
    number: string;
    type: string;
  };
}

interface BookingCreate {
  guest_id: number;
  room_id: number;
  check_in_date: string;
  check_out_date: string;
  special_requests?: string;
  total_price?: number;
  payment_status?: string;
}

interface Guest {
  id: number;
  first_name: string;
  last_name: string;
}

interface Room {
  id: number;
  number: string;
  type: string;
}

function Bookings() {
  const [open, setOpen] = useState(false);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);
  const [formData, setFormData] = useState<BookingCreate>({
    guest_id: 0,
    room_id: 0,
    check_in_date: new Date().toISOString().split('T')[0],
    check_out_date: new Date().toISOString().split('T')[0],
    special_requests: '',
    total_price: 0,
    payment_status: 'pending',
  });

  const queryClient = useQueryClient();

  const { data: bookings, isLoading, error } = useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await client.get('/bookings');
      return response.data;
    },
  });

  const { data: rooms } = useQuery<Room[]>({
    queryKey: ['rooms'],
    queryFn: async () => {
      const response = await client.get('/rooms');
      return response.data;
    },
  });

  const { data: guests } = useQuery<Guest[]>({
    queryKey: ['guests'],
    queryFn: async () => {
      const response = await client.get('/guests');
      return response.data;
    },
  });

  const createBooking = useMutation({
    mutationFn: async (newBooking: BookingCreate) => {
      const response = await client.post('/bookings', newBooking);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateBooking = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<BookingCreate> }) => {
      const response = await client.put(`/bookings/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
      setOpen(false);
      setEditingBooking(null);
      resetForm();
    },
  });

  const deleteBooking = useMutation({
    mutationFn: async (id: number) => {
      await client.delete(`/bookings/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const checkInBooking = useMutation({
    mutationFn: async (id: number) => {
      const response = await client.post(`/bookings/${id}/checkin`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
  });

  const resetForm = () => {
    setFormData({
      guest_id: 0,
      room_id: 0,
      check_in_date: new Date().toISOString().split('T')[0],
      check_out_date: new Date().toISOString().split('T')[0],
      special_requests: '',
      total_price: 0,
      payment_status: 'pending',
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBooking) {
      updateBooking.mutate({ id: editingBooking.id, data: formData });
    } else {
      createBooking.mutate(formData);
    }
  };

  const handleEdit = (booking: Booking) => {
    setEditingBooking(booking);
    setFormData({
      guest_id: booking.guest_id,
      room_id: booking.room_id,
      check_in_date: booking.check_in_date,
      check_out_date: booking.check_out_date,
      special_requests: booking.special_requests || '',
      total_price: booking.total_price,
      payment_status: booking.payment_status,
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить это бронирование?')) {
      deleteBooking.mutate(id);
    }
  };

  const handleCheckIn = (id: number) => {
    if (window.confirm('Вы уверены, что хотите зарегистрировать заезд?')) {
      checkInBooking.mutate(id);
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
    setEditingBooking(null);
    resetForm();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'warning';
      case 'confirmed':
        return 'info';
      case 'checked_in':
        return 'success';
      case 'checked_out':
        return 'default';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending':
        return 'Ожидает';
      case 'confirmed':
        return 'Подтверждено';
      case 'checked_in':
        return 'Заселен';
      case 'checked_out':
        return 'Выселен';
      case 'cancelled':
        return 'Отменено';
      default:
        return status;
    }
  };

  if (isLoading) {
    return <Typography>Загрузка...</Typography>;
  }

  if (error) {
    return <Typography color="error">Ошибка загрузки бронирований</Typography>;
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h5">Бронирования</Typography>
        <Button variant="contained" color="primary" onClick={() => setOpen(true)}>
          Добавить бронирование
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Гость</TableCell>
              <TableCell>Номер</TableCell>
              <TableCell>Заезд</TableCell>
              <TableCell>Выезд</TableCell>
              <TableCell>Статус</TableCell>
              <TableCell>Сумма</TableCell>
              <TableCell>Оплата</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {bookings?.map((booking) => (
              <TableRow key={booking.id}>
                <TableCell>
                  {booking.guest ? `${booking.guest.first_name} ${booking.guest.last_name}` : 'N/A'}
                </TableCell>
                <TableCell>
                  {booking.room ? `№${booking.room.number} (${booking.room.type})` : 'N/A'}
                </TableCell>
                <TableCell>{format(new Date(booking.check_in_date), 'dd.MM.yyyy')}</TableCell>
                <TableCell>{format(new Date(booking.check_out_date), 'dd.MM.yyyy')}</TableCell>
                <TableCell>
                  <Chip
                    label={getStatusLabel(booking.status)}
                    color={getStatusColor(booking.status)}
                  />
                </TableCell>
                <TableCell>{booking.total_price} ₽</TableCell>
                <TableCell>
                  <Chip
                    label={booking.payment_status}
                    color={booking.payment_status === 'paid' ? 'success' : 'warning'}
                  />
                </TableCell>
                <TableCell>
                  <Tooltip title="Редактировать">
                    <IconButton size="small" onClick={() => handleEdit(booking)}>
                      <EditIcon />
                    </IconButton>
                  </Tooltip>
                  <Tooltip title="Удалить">
                    <IconButton size="small" color="error" onClick={() => handleDelete(booking.id)}>
                      <DeleteIcon />
                    </IconButton>
                  </Tooltip>
                  {booking.status === 'confirmed' && (
                    <Tooltip title="Зарегистрировать заезд">
                      <IconButton size="small" color="success" onClick={() => handleCheckIn(booking.id)}>
                        <CheckIcon />
                      </IconButton>
                    </Tooltip>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
        <DialogTitle>{editingBooking ? 'Редактировать бронирование' : 'Новое бронирование'}</DialogTitle>
        <DialogContent>
          <Box component="form" sx={{ mt: 2 }} onSubmit={handleSubmit}>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Autocomplete
                options={guests || []}
                getOptionLabel={(option) => `${option.first_name} ${option.last_name}`}
                value={guests?.find(g => g.id === formData.guest_id) || null}
                onChange={(_, newValue) => {
                  setFormData(prev => ({
                    ...prev,
                    guest_id: newValue?.id || 0
                  }));
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Гость"
                    required
                  />
                )}
                filterOptions={(options, { inputValue }) => {
                  const searchTerm = inputValue.toLowerCase();
                  return options.filter(
                    option => 
                      option.first_name.toLowerCase().includes(searchTerm) ||
                      option.last_name.toLowerCase().includes(searchTerm)
                  );
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Номер</InputLabel>
                <Select
                  name="room_id"
                  value={formData.room_id || ''}
                  onChange={handleChange}
                  label="Номер"
                  required
                >
                  {rooms?.map((room) => (
                    <MenuItem key={room.id} value={room.id}>
                      {`№${room.number} (${room.type})`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2 }}>
                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                  <DatePicker
                    label="Дата заезда"
                    value={formData.check_in_date ? new Date(formData.check_in_date) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setFormData({ ...formData, check_in_date: date.toISOString() });
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>

                <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={ru}>
                  <DatePicker
                    label="Дата выезда"
                    value={formData.check_out_date ? new Date(formData.check_out_date) : null}
                    onChange={(date: Date | null) => {
                      if (date) {
                        setFormData({ ...formData, check_out_date: date.toISOString() });
                      }
                    }}
                    slotProps={{ textField: { fullWidth: true } }}
                  />
                </LocalizationProvider>
              </Box>

              <TextField
                fullWidth
                label="Общая стоимость"
                name="total_price"
                type="number"
                value={formData.total_price || ''}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
              />

              <FormControl fullWidth>
                <InputLabel>Статус оплаты</InputLabel>
                <Select
                  name="payment_status"
                  value={formData.payment_status || 'pending'}
                  onChange={handleChange}
                  label="Статус оплаты"
                >
                  <MenuItem value="pending">Ожидает оплаты</MenuItem>
                  <MenuItem value="paid">Оплачено</MenuItem>
                </Select>
              </FormControl>

              {editingBooking && (
                <FormControl fullWidth>
                  <InputLabel>Статус бронирования</InputLabel>
                  <Select
                    name="status"
                    value={editingBooking.status}
                    onChange={handleChange}
                    label="Статус бронирования"
                  >
                    <MenuItem value="pending">Ожидает</MenuItem>
                    <MenuItem value="confirmed">Подтверждено</MenuItem>
                    <MenuItem value="checked_in">Заселен</MenuItem>
                    <MenuItem value="checked_out">Выселен</MenuItem>
                    <MenuItem value="cancelled">Отменено</MenuItem>
                  </Select>
                </FormControl>
              )}
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose}>Отмена</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={createBooking.isPending || updateBooking.isPending}
          >
            {editingBooking ? 'Сохранить' : 'Создать'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}

export default Bookings; 