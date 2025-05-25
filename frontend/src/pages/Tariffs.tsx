import { useState } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  InputAdornment,
} from '@mui/material';
import { Add as AddIcon, Edit as EditIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { tariffApi } from '../api/tariff';
import type { RoomTariff, TariffCreate } from '../types/tariff';

const ROOM_TYPES = [
  { value: 'GUEST_HOUSE', label: 'Гостевой Дом' },
  { value: 'FRAME', label: 'А-Фреймы' },
];

function Tariffs() {
  const [open, setOpen] = useState(false);
  const [editingTariff, setEditingTariff] = useState<RoomTariff | null>(null);
  const [formData, setFormData] = useState<TariffCreate>({
    room_type: '',
    price_per_night: 0,
    weekend_price_per_night: null,
    min_nights: 1,
    start_date: new Date().toISOString().split('T')[0],
    end_date: new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();

  const { data: tariffs = [] } = useQuery<RoomTariff[]>({
    queryKey: ['tariffs'],
    queryFn: () => tariffApi.getTariffs(),
  });

  const createTariff = useMutation({
    mutationFn: tariffApi.createTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      setOpen(false);
      resetForm();
    },
  });

  const updateTariff = useMutation({
    mutationFn: ({ id, data }: { id: number; data: Partial<TariffCreate> }) =>
      tariffApi.updateTariff(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
      setOpen(false);
      setEditingTariff(null);
      resetForm();
    },
  });

  const deleteTariff = useMutation({
    mutationFn: tariffApi.deleteTariff,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tariffs'] });
    },
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | { target: { name: string; value: unknown } }
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTariff) {
      updateTariff.mutate({ id: editingTariff.id, data: formData });
    } else {
      createTariff.mutate(formData);
    }
  };

  const handleEdit = (tariff: RoomTariff) => {
    setEditingTariff(tariff);
    setFormData({
      room_type: tariff.room_type,
      price_per_night: tariff.price_per_night,
      weekend_price_per_night: tariff.weekend_price_per_night,
      min_nights: tariff.min_nights,
      start_date: tariff.start_date.split('T')[0],
      end_date: tariff.end_date.split('T')[0],
    });
    setOpen(true);
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить этот тариф?')) {
      deleteTariff.mutate(id);
    }
  };

  const resetForm = () => {
    setFormData({
      room_type: '',
      price_per_night: 0,
      weekend_price_per_night: null,
      min_nights: 1,
      start_date: new Date().toISOString().split('T')[0],
      end_date: new Date().toISOString().split('T')[0],
    });
    setEditingTariff(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Управление тарифами
      </Typography>

      <Box sx={{ mb: 2 }}>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            resetForm();
            setOpen(true);
          }}
        >
          Добавить тариф
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Тип номера</TableCell>
              <TableCell>Цена за ночь (будни)</TableCell>
              <TableCell>Цена за ночь (выходные)</TableCell>
              <TableCell>Мин. ночей</TableCell>
              <TableCell>Дата начала</TableCell>
              <TableCell>Дата окончания</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {tariffs?.map((tariff) => (
              <TableRow key={tariff.id}>
                <TableCell>
                  {ROOM_TYPES.find(t => t.value === tariff.room_type)?.label || tariff.room_type}
                </TableCell>
                <TableCell>₽{tariff.price_per_night.toLocaleString()}</TableCell>
                <TableCell>
                  {tariff.weekend_price_per_night 
                    ? `₽${tariff.weekend_price_per_night.toLocaleString()}`
                    : 'Не указана'}
                </TableCell>
                <TableCell>{tariff.min_nights}</TableCell>
                <TableCell>{format(new Date(tariff.start_date), 'dd.MM.yyyy')}</TableCell>
                <TableCell>{format(new Date(tariff.end_date), 'dd.MM.yyyy')}</TableCell>
                <TableCell>
                  <IconButton size="small" onClick={() => handleEdit(tariff)}>
                    <EditIcon />
                  </IconButton>
                  <IconButton size="small" color="error" onClick={() => handleDelete(tariff.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>
            {editingTariff ? 'Редактировать тариф' : 'Добавить новый тариф'}
          </DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Тип номера</InputLabel>
                <Select
                  name="room_type"
                  value={formData.room_type}
                  onChange={handleChange}
                  label="Тип номера"
                >
                  {ROOM_TYPES.map((type) => (
                    <MenuItem key={type.value} value={type.value}>
                      {type.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>

              <TextField
                name="price_per_night"
                label="Цена за ночь (будни)"
                type="number"
                value={formData.price_per_night}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                }}
              />

              <TextField
                name="weekend_price_per_night"
                label="Цена за ночь (выходные)"
                type="number"
                value={formData.weekend_price_per_night || ''}
                onChange={handleChange}
                InputProps={{
                  startAdornment: <InputAdornment position="start">₽</InputAdornment>,
                }}
                helperText="Оставьте пустым, если цена такая же как в будни"
              />

              <TextField
                name="min_nights"
                label="Минимальное количество ночей"
                type="number"
                value={formData.min_nights}
                onChange={handleChange}
              />

              <TextField
                name="start_date"
                label="Дата начала"
                type="date"
                value={formData.start_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />

              <TextField
                name="end_date"
                label="Дата окончания"
                type="date"
                value={formData.end_date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained">
              {editingTariff ? 'Сохранить' : 'Добавить'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Tariffs; 