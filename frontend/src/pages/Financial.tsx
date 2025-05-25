import { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
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
  Chip,
  InputAdornment,
  IconButton,
} from '@mui/material';
import { Add as AddIcon, Search as SearchIcon, Delete as DeleteIcon } from '@mui/icons-material';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { financialApi } from '../api/financial';
import type { FinancialTransaction, TransactionCreate } from '../types/financial';

function Financial() {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [formData, setFormData] = useState<TransactionCreate>({
    amount: 0,
    transaction_type: 'income',
    category: '',
    description: '',
    payment_method: 'cash',
    transaction_date: new Date().toISOString().split('T')[0],
  });

  const queryClient = useQueryClient();

  const { data: transactions } = useQuery<FinancialTransaction[]>({
    queryKey: ['transactions'],
    queryFn: financialApi.getTransactions,
  });

  const createTransaction = useMutation({
    mutationFn: financialApi.createTransaction,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
      setOpen(false);
      resetForm();
    },
  });

  const deleteTransaction = useMutation({
    mutationFn: async (id: number) => {
      await financialApi.deleteTransaction(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] });
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }> | { target: { name: string; value: unknown } }) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name as string]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createTransaction.mutate(formData);
  };

  const resetForm = () => {
    setFormData({
      amount: 0,
      transaction_type: 'income',
      category: '',
      description: '',
      payment_method: 'cash',
      transaction_date: new Date().toISOString().split('T')[0],
    });
  };

  const handleDelete = (id: number) => {
    if (window.confirm('Вы уверены, что хотите удалить эту транзакцию?')) {
      deleteTransaction.mutate(id);
    }
  };

  const filteredTransactions = transactions?.filter(transaction => 
    transaction.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    transaction.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalIncome = transactions?.reduce((sum, t) => 
    t.transaction_type === 'income' ? sum + t.amount : sum, 0) || 0;
  
  const totalExpenses = transactions?.reduce((sum, t) => 
    t.transaction_type === 'expense' ? sum + t.amount : sum, 0) || 0;

  const netIncome = totalIncome - totalExpenses;

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Финансовый менеджмент
      </Typography>

      {/* Dashboard Cards */}
      <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: 'repeat(3, 1fr)' }, gap: 3, mb: 4 }}>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Общий доход
            </Typography>
            <Typography variant="h5" color="success.main">
              ₽{totalIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Общие расходы
            </Typography>
            <Typography variant="h5" color="error.main">
              ₽{totalExpenses.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
        <Card>
          <CardContent>
            <Typography color="textSecondary" gutterBottom>
              Чистая прибыль
            </Typography>
            <Typography variant="h5" color={netIncome >= 0 ? 'success.main' : 'error.main'}>
              ₽{netIncome.toLocaleString()}
            </Typography>
          </CardContent>
        </Card>
      </Box>

      {/* Transactions Table */}
      <Box sx={{ mb: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <TextField
          placeholder="Поиск транзакций..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          }}
          sx={{ width: 300 }}
        />
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpen(true)}
        >
          Добавить транзакцию
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Дата</TableCell>
              <TableCell>Тип</TableCell>
              <TableCell>Категория</TableCell>
              <TableCell>Описание</TableCell>
              <TableCell>Способ оплаты</TableCell>
              <TableCell align="right">Сумма</TableCell>
              <TableCell>Действия</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredTransactions?.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{format(new Date(transaction.transaction_date), 'dd.MM.yyyy')}</TableCell>
                <TableCell>
                  <Chip
                    label={transaction.transaction_type === 'income' ? 'Доход' : 'Расход'}
                    color={transaction.transaction_type === 'income' ? 'success' : 'error'}
                    size="small"
                  />
                </TableCell>
                <TableCell>{transaction.category}</TableCell>
                <TableCell>{transaction.description}</TableCell>
                <TableCell>
                  {transaction.payment_method === 'cash' ? 'Наличные' :
                   transaction.payment_method === 'card' ? 'Карта' :
                   'Банковский перевод'}
                </TableCell>
                <TableCell align="right" sx={{ 
                  color: transaction.transaction_type === 'income' ? 'success.main' : 'error.main'
                }}>
                  ₽{transaction.amount.toLocaleString()}
                </TableCell>
                <TableCell>
                  <IconButton size="small" color="error" onClick={() => handleDelete(transaction.id)}>
                    <DeleteIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Add Transaction Dialog */}
      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <form onSubmit={handleSubmit}>
          <DialogTitle>Добавить новую транзакцию</DialogTitle>
          <DialogContent>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
              <FormControl fullWidth>
                <InputLabel>Тип транзакции</InputLabel>
                <Select
                  name="transaction_type"
                  value={formData.transaction_type}
                  onChange={handleChange}
                  label="Тип транзакции"
                >
                  <MenuItem value="income">Доход</MenuItem>
                  <MenuItem value="expense">Расход</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Сумма"
                name="amount"
                type="number"
                value={formData.amount}
                onChange={handleChange}
                InputProps={{
                  endAdornment: <InputAdornment position="end">₽</InputAdornment>,
                }}
              />

              <TextField
                fullWidth
                label="Категория"
                name="category"
                value={formData.category}
                onChange={handleChange}
              />

              <TextField
                fullWidth
                label="Описание"
                name="description"
                value={formData.description}
                onChange={handleChange}
                multiline
                rows={2}
              />

              <FormControl fullWidth>
                <InputLabel>Способ оплаты</InputLabel>
                <Select
                  name="payment_method"
                  value={formData.payment_method}
                  onChange={handleChange}
                  label="Способ оплаты"
                >
                  <MenuItem value="cash">Наличные</MenuItem>
                  <MenuItem value="card">Карта</MenuItem>
                  <MenuItem value="bank_transfer">Банковский перевод</MenuItem>
                </Select>
              </FormControl>

              <TextField
                fullWidth
                label="Дата транзакции"
                name="transaction_date"
                type="date"
                value={formData.transaction_date}
                onChange={handleChange}
                InputLabelProps={{
                  shrink: true,
                }}
              />
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Отмена</Button>
            <Button type="submit" variant="contained">Добавить</Button>
          </DialogActions>
        </form>
      </Dialog>
    </Box>
  );
}

export default Financial; 