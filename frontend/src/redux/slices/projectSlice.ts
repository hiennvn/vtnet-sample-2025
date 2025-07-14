import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectFetchParams } from '../../types/project';
import * as projectApi from '../../api/projectApi';
import { RootState } from '../store';

// Define the state interface
interface ProjectState {
  projects: Project[];
  selectedProject: Project | null;
  loading: boolean;
  error: string | null;
  pagination: {
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  };
  filter: {
    status: string | null;
    name: string | null;
  };
}

// Initial state
const initialState: ProjectState = {
  projects: [],
  selectedProject: null,
  loading: false,
  error: null,
  pagination: {
    totalElements: 0,
    totalPages: 0,
    currentPage: 0,
    pageSize: 10
  },
  filter: {
    status: null,
    name: null
  }
};

// Async thunks
export const fetchProjects = createAsyncThunk(
  'projects/fetchProjects',
  async (params: ProjectFetchParams, { rejectWithValue }) => {
    try {
      return await projectApi.getProjects(params);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const fetchProjectById = createAsyncThunk(
  'projects/fetchProjectById',
  async (id: number, { rejectWithValue }) => {
    try {
      return await projectApi.getProjectById(id);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

// Create the slice
const projectSlice = createSlice({
  name: 'projects',
  initialState,
  reducers: {
    setProjects: (state, action: PayloadAction<Project[]>) => {
      state.projects = action.payload;
    },
    setSelectedProject: (state, action: PayloadAction<Project | null>) => {
      state.selectedProject = action.payload;
    },
    setStatusFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.status = action.payload;
    },
    setNameFilter: (state, action: PayloadAction<string | null>) => {
      state.filter.name = action.payload;
    },
    clearFilters: (state) => {
      state.filter.status = null;
      state.filter.name = null;
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
      // Fetch projects
      .addCase(fetchProjects.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjects.fulfilled, (state, action) => {
        state.loading = false;
        state.projects = action.payload.content;
        state.pagination = {
          totalElements: action.payload.totalElements,
          totalPages: action.payload.totalPages,
          currentPage: action.payload.number,
          pageSize: action.payload.size
        };
      })
      .addCase(fetchProjects.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch projects';
      })
      
      // Fetch project by ID
      .addCase(fetchProjectById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchProjectById.fulfilled, (state, action) => {
        state.loading = false;
        state.selectedProject = action.payload;
      })
      .addCase(fetchProjectById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to fetch project';
      });
  }
});

// Export actions
export const {
  setProjects,
  setSelectedProject,
  setStatusFilter,
  setNameFilter,
  clearFilters,
  setLoading,
  setError
} = projectSlice.actions;

// Export selectors
export const selectProjects = (state: RootState) => state.projects.projects;
export const selectSelectedProject = (state: RootState) => state.projects.selectedProject;
export const selectProjectLoading = (state: RootState) => state.projects.loading;
export const selectProjectError = (state: RootState) => state.projects.error;
export const selectProjectPagination = (state: RootState) => state.projects.pagination;
export const selectProjectFilters = (state: RootState) => state.projects.filter;

export default projectSlice.reducer; 