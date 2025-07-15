import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { FolderDTO } from '../../types/folder';
import * as folderApi from '../../api/folderApi';

// Define the state interface
interface FolderState {
  folders: FolderDTO[];
  currentFolder: FolderDTO | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: FolderState = {
  folders: [],
  currentFolder: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchProjectRootFolders = createAsyncThunk(
  'folders/fetchProjectRootFolders',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await folderApi.getProjectRootFolders(projectId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project root folders');
    }
  }
);

export const fetchSubfolders = createAsyncThunk(
  'folders/fetchSubfolders',
  async (folderId: number, { rejectWithValue }) => {
    try {
      return await folderApi.getSubfolders(folderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch subfolders');
    }
  }
);

export const fetchFolderById = createAsyncThunk(
  'folders/fetchFolderById',
  async (folderId: number, { rejectWithValue }) => {
    try {
      return await folderApi.getFolderById(folderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folder');
    }
  }
);

export const createFolder = createAsyncThunk(
  'folders/createFolder',
  async (
    { name, projectId, parentFolderId }: { name: string; projectId: number; parentFolderId?: number },
    { rejectWithValue }
  ) => {
    try {
      return await folderApi.createFolder(name, projectId, parentFolderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create folder');
    }
  }
);

// Create the slice
const folderSlice = createSlice({
  name: 'folders',
  initialState,
  reducers: {
    clearFolders: (state) => {
      state.folders = [];
    },
    clearCurrentFolder: (state) => {
      state.currentFolder = null;
    }
  },
  extraReducers: (builder) => {
    // fetchProjectRootFolders
    builder.addCase(fetchProjectRootFolders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectRootFolders.fulfilled, (state, action: PayloadAction<FolderDTO[]>) => {
      state.loading = false;
      state.folders = action.payload;
    });
    builder.addCase(fetchProjectRootFolders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchSubfolders
    builder.addCase(fetchSubfolders.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchSubfolders.fulfilled, (state, action: PayloadAction<FolderDTO[]>) => {
      state.loading = false;
      state.folders = action.payload;
    });
    builder.addCase(fetchSubfolders.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchFolderById
    builder.addCase(fetchFolderById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFolderById.fulfilled, (state, action: PayloadAction<FolderDTO>) => {
      state.loading = false;
      state.currentFolder = action.payload;
    });
    builder.addCase(fetchFolderById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // createFolder
    builder.addCase(createFolder.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(createFolder.fulfilled, (state, action: PayloadAction<FolderDTO>) => {
      state.loading = false;
      // Add the new folder to the folders list if it's a child of the current folder
      if (state.currentFolder && state.currentFolder.id === action.payload.parentFolderId) {
        state.folders = [...state.folders, action.payload];
      }
      // If we're at the root level and the new folder is also at root level
      else if (!state.currentFolder && !action.payload.parentFolderId) {
        state.folders = [...state.folders, action.payload];
      }
    });
    builder.addCase(createFolder.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// Export actions and reducer
export const { clearFolders, clearCurrentFolder } = folderSlice.actions;
export default folderSlice.reducer; 