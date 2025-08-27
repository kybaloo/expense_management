import { createContext, useContext, useReducer, useCallback } from 'react';
import api from '../utils/api';

const TransactionContext = createContext();

// Transaction actions
const TRANSACTION_ACTIONS = {
  SET_LOADING: 'SET_LOADING',
  SET_TRANSACTIONS: 'SET_TRANSACTIONS',
  ADD_TRANSACTION: 'ADD_TRANSACTION',
  UPDATE_TRANSACTION: 'UPDATE_TRANSACTION',
  DELETE_TRANSACTION: 'DELETE_TRANSACTION',
  SET_ERROR: 'SET_ERROR',
  SET_FILTERS: 'SET_FILTERS',
  SET_PAGINATION: 'SET_PAGINATION',
};

// Initial state
const initialState = {
  transactions: [],
  isLoading: false,
  error: null,
  pagination: {
    currentPage: 1,
    totalPages: 1,
    total: 0,
  },
  filters: {
    type: '',
    category: '',
    startDate: '',
    endDate: '',
    search: '',
  },
};

// Transaction reducer
const transactionReducer = (state, action) => {
  switch (action.type) {
    case TRANSACTION_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload,
      };
    case TRANSACTION_ACTIONS.SET_TRANSACTIONS:
      return {
        ...state,
        transactions: action.payload,
        isLoading: false,
        error: null,
      };
    case TRANSACTION_ACTIONS.ADD_TRANSACTION:
      return {
        ...state,
        transactions: [action.payload, ...state.transactions],
      };
    case TRANSACTION_ACTIONS.UPDATE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.map(transaction =>
          transaction._id === action.payload._id ? action.payload : transaction
        ),
      };
    case TRANSACTION_ACTIONS.DELETE_TRANSACTION:
      return {
        ...state,
        transactions: state.transactions.filter(
          transaction => transaction._id !== action.payload
        ),
      };
    case TRANSACTION_ACTIONS.SET_ERROR:
      return {
        ...state,
        error: action.payload,
        isLoading: false,
      };
    case TRANSACTION_ACTIONS.SET_FILTERS:
      return {
        ...state,
        filters: { ...state.filters, ...action.payload },
      };
    case TRANSACTION_ACTIONS.SET_PAGINATION:
      return {
        ...state,
        pagination: action.payload,
      };
    default:
      return state;
  }
};

// Transaction provider component
export const TransactionProvider = ({ children }) => {
  const [state, dispatch] = useReducer(transactionReducer, initialState);

  // Fetch transactions
  const fetchTransactions = useCallback(async (page = 1, filters = {}) => {
    dispatch({ type: TRANSACTION_ACTIONS.SET_LOADING, payload: true });
    
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...filters,
      });

      const response = await api.get(`/transactions?${params}`);
      const { transactions, totalPages, currentPage, total } = response.data;
      
      dispatch({
        type: TRANSACTION_ACTIONS.SET_TRANSACTIONS,
        payload: transactions,
      });
      
      dispatch({
        type: TRANSACTION_ACTIONS.SET_PAGINATION,
        payload: { currentPage: parseInt(currentPage), totalPages, total },
      });
    } catch (error) {
      dispatch({
        type: TRANSACTION_ACTIONS.SET_ERROR,
        payload: error.response?.data?.message || 'Failed to fetch transactions',
      });
    }
  }, []);

  // Create transaction
  const createTransaction = async (transactionData) => {
    try {
      const response = await api.post('/transactions', transactionData);
      dispatch({
        type: TRANSACTION_ACTIONS.ADD_TRANSACTION,
        payload: response.data,
      });
      return { success: true, transaction: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to create transaction';
      dispatch({
        type: TRANSACTION_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Update transaction
  const updateTransaction = async (id, transactionData) => {
    try {
      const response = await api.put(`/transactions/${id}`, transactionData);
      dispatch({
        type: TRANSACTION_ACTIONS.UPDATE_TRANSACTION,
        payload: response.data,
      });
      return { success: true, transaction: response.data };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to update transaction';
      dispatch({
        type: TRANSACTION_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Delete transaction
  const deleteTransaction = async (id) => {
    try {
      await api.delete(`/transactions/${id}`);
      dispatch({
        type: TRANSACTION_ACTIONS.DELETE_TRANSACTION,
        payload: id,
      });
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to delete transaction';
      dispatch({
        type: TRANSACTION_ACTIONS.SET_ERROR,
        payload: errorMessage,
      });
      return { success: false, error: errorMessage };
    }
  };

  // Set filters
  const setFilters = (newFilters) => {
    dispatch({
      type: TRANSACTION_ACTIONS.SET_FILTERS,
      payload: newFilters,
    });
  };

  // Clear error
  const clearError = () => {
    dispatch({
      type: TRANSACTION_ACTIONS.SET_ERROR,
      payload: null,
    });
  };

  const value = {
    ...state,
    fetchTransactions,
    createTransaction,
    updateTransaction,
    deleteTransaction,
    setFilters,
    clearError,
  };

  return (
    <TransactionContext.Provider value={value}>
      {children}
    </TransactionContext.Provider>
  );
};

// Custom hook to use transaction context
export const useTransactions = () => {
  const context = useContext(TransactionContext);
  if (!context) {
    throw new Error('useTransactions must be used within a TransactionProvider');
  }
  return context;
};
