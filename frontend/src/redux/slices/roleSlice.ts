import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Role } from '../../types/user';
import * as roleApi from '../../api/roleApi';
import { RootState } from '../store';

// Define the state interface
interface RoleState {
  roles: Role[];
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: RoleState = {
  roles: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchAllRoles = createAsyncThunk(
  'roles/fetchAllRoles',
  async (_, { rejectWithValue }) => {
    try {
      return await roleApi.getAllRoles();
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

// Create the slice
const roleSlice = createSlice({
  name: 'roles',
  initialState,
  reducers: {
    setRoles: (state, action: PayloadAction<Role[]>) => {
      state.roles = action.payload;
    },
    addRole: (state, action: PayloadAction<Role>) => {
      state.roles.push(action.payload);
    },
    updateRole: (state, action: PayloadAction<Role>) => {
      const index = state.roles.findIndex(role => role.id === action.payload.id);
      if (index !== -1) {
        state.roles[index] = action.payload;
      }
    },
    removeRole: (state, action: PayloadAction<number>) => {
      state.roles = state.roles.filter(role => role.id !== action.payload);
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch all roles
      .addCase(fetchAllRoles.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAllRoles.fulfilled, (state, action) => {
        state.loading = false;
        state.roles = action.payload;
      })
      .addCase(fetchAllRoles.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch roles';
      });
  },
});

// Export actions
export const { setRoles, addRole, updateRole, removeRole } = roleSlice.actions;

// Export selectors
export const selectRoles = (state: RootState) => state.roles.roles;
export const selectRoleLoading = (state: RootState) => state.roles.loading;
export const selectRoleError = (state: RootState) => state.roles.error;

// Export reducer
export default roleSlice.reducer; 