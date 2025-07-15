import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { ProjectMember, ProjectMemberCreate, ProjectMemberUpdate } from '../../types/projectMember';
import { User } from '../../types/user';
import * as projectMemberApi from '../../api/projectMemberApi';
import { RootState } from '../store';

// Define the state interface
interface ProjectMemberState {
  members: ProjectMember[];
  availableUsers: User[];
  loading: boolean;
  error: string | null;
  currentProjectId: number | null;
}

// Initial state
const initialState: ProjectMemberState = {
  members: [],
  availableUsers: [],
  loading: false,
  error: null,
  currentProjectId: null
};

// Async thunks
export const fetchProjectMembers = createAsyncThunk(
  'projectMembers/fetchProjectMembers',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await projectMemberApi.getProjectMembers(projectId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const addProjectMember = createAsyncThunk(
  'projectMembers/addProjectMember',
  async ({ projectId, memberData }: { projectId: number, memberData: ProjectMemberCreate }, { rejectWithValue }) => {
    try {
      return await projectMemberApi.addProjectMember(projectId, memberData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateProjectMember = createAsyncThunk(
  'projectMembers/updateProjectMember',
  async ({ projectId, userId, memberData }: { projectId: number, userId: number, memberData: ProjectMemberUpdate }, { rejectWithValue }) => {
    try {
      return await projectMemberApi.updateProjectMember(projectId, userId, memberData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const removeProjectMember = createAsyncThunk(
  'projectMembers/removeProjectMember',
  async ({ projectId, userId }: { projectId: number, userId: number }, { rejectWithValue }) => {
    try {
      await projectMemberApi.removeProjectMember(projectId, userId);
      return userId;
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const fetchAvailableUsers = createAsyncThunk(
  'projectMembers/fetchAvailableUsers',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await projectMemberApi.getAvailableUsers(projectId);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// Create the slice
const projectMemberSlice = createSlice({
  name: 'projectMembers',
  initialState,
  reducers: {
    setCurrentProjectId: (state, action: PayloadAction<number | null>) => {
      state.currentProjectId = action.payload;
    },
    clearMembers: (state) => {
      state.members = [];
      state.availableUsers = [];
      state.currentProjectId = null;
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
      // Fetch project members
      .addCase(fetchProjectMembers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectMembers.fulfilled, (state, action) => {
        state.loading = false;
        state.members = action.payload;
        if (action.meta.arg) {
          state.currentProjectId = action.meta.arg;
        }
      })
      .addCase(fetchProjectMembers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch project members';
      })
      
      // Add project member
      .addCase(addProjectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(addProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members.push(action.payload);
        // Remove the user from available users
        state.availableUsers = state.availableUsers.filter(user => user.id !== action.payload.userId);
      })
      .addCase(addProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to add project member';
      })
      
      // Update project member
      .addCase(updateProjectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.members.findIndex(member => member.userId === action.payload.userId);
        if (index !== -1) {
          state.members[index] = action.payload;
        }
      })
      .addCase(updateProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update project member';
      })
      
      // Remove project member
      .addCase(removeProjectMember.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(removeProjectMember.fulfilled, (state, action) => {
        state.loading = false;
        state.members = state.members.filter(member => member.userId !== action.payload);
      })
      .addCase(removeProjectMember.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to remove project member';
      })
      
      // Fetch available users
      .addCase(fetchAvailableUsers.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAvailableUsers.fulfilled, (state, action) => {
        state.loading = false;
        state.availableUsers = action.payload;
      })
      .addCase(fetchAvailableUsers.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch available users';
      });
  }
});

// Export actions
export const {
  setCurrentProjectId,
  clearMembers,
  setLoading,
  setError
} = projectMemberSlice.actions;

// Export selectors
export const selectMembers = (state: RootState) => state.projectMembers.members;
export const selectAvailableUsers = (state: RootState) => state.projectMembers.availableUsers;
export const selectLoading = (state: RootState) => state.projectMembers.loading;
export const selectError = (state: RootState) => state.projectMembers.error;
export const selectCurrentProjectId = (state: RootState) => state.projectMembers.currentProjectId;

export default projectMemberSlice.reducer; 