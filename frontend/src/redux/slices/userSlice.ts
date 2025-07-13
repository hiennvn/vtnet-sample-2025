import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { 
  User, 
  UserCreateRequest as UserCreate, 
  UserUpdateRequest as UserUpdate, 
  UserFetchParams as PaginationParams, 
  UserSearchParams 
} from '../../types/user';
import * as userApi from '../../api/userApi';
import { RootState } from '../store';

// Define the state interface
interface UserState {
  users: User[];
  selectedUser: User | null;
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
}

// Initial state
const initialState: UserState = {
  users: [],
  selectedUser: null,
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  }
};

// Async thunks
export const fetchUsers = createAsyncThunk(
  'users/fetchUsers',
  async (params: PaginationParams, { rejectWithValue }) => {
    try {
      return await userApi.getUsers(params.page, params.size);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const fetchUserById = createAsyncThunk(
  'users/fetchUserById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await userApi.getUserById(id);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const createUser = createAsyncThunk(
  'users/createUser',
  async (userData: UserCreate, { rejectWithValue }) => {
    try {
      return await userApi.createUser(userData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const updateUser = createAsyncThunk(
  'users/updateUser',
  async ({ id, userData }: { id: number, userData: UserUpdate }, { rejectWithValue }) => {
    try {
      return await userApi.updateUser(id, userData);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const deleteUser = createAsyncThunk(
  'users/deleteUser',
  async (id: number, { rejectWithValue }) => {
    try {
      await userApi.deleteUser(id);
      return id;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const searchUsers = createAsyncThunk(
  'users/searchUsers',
  async (params: UserSearchParams, { rejectWithValue }) => {
    try {
      return await userApi.searchUsers(params.query, params.page, params.size);
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Create the slice
const userSlice = createSlice({
  name: 'users',
  initialState,
  reducers: {
    setUsers: (state, action: PayloadAction<User[]>) => {
      state.users = action.payload;
    },
    setSelectedUser: (state, action: PayloadAction<User | null>) => {
      state.selectedUser = action.payload;
    },
    addUser: (state, action: PayloadAction<User>) => {
      state.users.push(action.payload);
    },
    updateUserInState: (state, action: PayloadAction<User>) => {
      const index = state.users.findIndex(user => user.id === action.payload.id);
      if (index !== -1) {
        state.users[index] = action.payload;
      }
    },
    removeUser: (state, action: PayloadAction<number>) => {
      state.users = state.users.filter(user => user.id !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch users
      .addCase(fetchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.number,
          pageSize: action.payload.size
        };
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch users';
      })
      
      // Fetch user by ID
      .addCase(fetchUserById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedUser = action.payload;
      })
      .addCase(fetchUserById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch user';
      })
      
      // Create user
      .addCase(createUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users.push(action.payload);
      })
      .addCase(createUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create user';
      })
      
      // Update user
      .addCase(updateUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateUser.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.users.findIndex(user => user.id === action.payload.id);
        if (index !== -1) {
          state.users[index] = action.payload;
        }
        if (state.selectedUser?.id === action.payload.id) {
          state.selectedUser = action.payload;
        }
      })
      .addCase(updateUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update user';
      })
      
      // Delete user
      .addCase(deleteUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteUser.fulfilled, (state, action) => {
        state.loading = false;
        state.users = state.users.filter(user => user.id !== action.payload);
        if (state.selectedUser?.id === action.payload) {
          state.selectedUser = null;
        }
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete user';
      })
      
      // Search users
      .addCase(searchUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(searchUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.users = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.number,
          pageSize: action.payload.size
        };
      })
      .addCase(searchUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to search users';
      });
  }
});

// Export actions
export const {
  setUsers,
  setSelectedUser,
  addUser,
  updateUserInState,
  removeUser,
  setLoading,
  setError
} = userSlice.actions;

// Export selectors
export const selectUsers = (state: RootState) => state.users.users;
export const selectSelectedUser = (state: RootState) => state.users.selectedUser;
export const selectUserLoading = (state: RootState) => state.users.loading;
export const selectUserError = (state: RootState) => state.users.error;
export const selectUserPagination = (state: RootState) => state.users.pagination;

// Export reducer
export default userSlice.reducer; 