import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { Project, ProjectFetchParams, ProjectCreatePayload, ProjectUpdatePayload } from '../../types/project';
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

export const createProject = createAsyncThunk(
  'projects/createProject',
  async (projectData: ProjectCreatePayload, { rejectWithValue }) => {
    try {
      return await projectApi.createProject(projectData);
    } catch (error) {
      return rejectWithValue(error instanceof Error ? error.message : 'An unknown error occurred');
    }
  }
);

export const updateProject = createAsyncThunk(
  'projects/updateProject',
  async ({ id, projectData }: { id: number; projectData: ProjectUpdatePayload }, { rejectWithValue }) => {
    try {
      return await projectApi.updateProject(id, projectData);
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

export const deleteProject = createAsyncThunk(
  'projects/deleteProject',
  async (id: number, { rejectWithValue }) => {
    try {
      await projectApi.deleteProject(id);
      return id; // Return the id so we can remove it from the state
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
      
      // Create project
      .addCase(createProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createProject.fulfilled, (state, action) => {
        state.loading = false;
        // Add the new project to the beginning of the list
        state.projects = [action.payload, ...state.projects];
      })
      .addCase(createProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to create project';
      })
      
      // Update project
      .addCase(updateProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateProject.fulfilled, (state, action) => {
        state.loading = false;
        // Update the project in the list
        state.projects = state.projects.map(project => 
          project.id === action.payload.id ? action.payload : project
        );
        // Update the selected project if it's the one that was updated
        if (state.selectedProject && state.selectedProject.id === action.payload.id) {
          state.selectedProject = action.payload;
        }
      })
      .addCase(updateProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to update project';
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
      })
      
      // Delete project
      .addCase(deleteProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteProject.fulfilled, (state, action) => {
        state.loading = false;
        // Remove the deleted project from the list
        state.projects = state.projects.filter(project => project.id !== action.payload);
        // Clear the selected project if it was the one that was deleted
        if (state.selectedProject && state.selectedProject.id === action.payload) {
          state.selectedProject = null;
        }
        // Update pagination
        if (state.pagination.totalElements > 0) {
          state.pagination.totalElements -= 1;
        }
      })
      .addCase(deleteProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string || 'Failed to delete project';
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