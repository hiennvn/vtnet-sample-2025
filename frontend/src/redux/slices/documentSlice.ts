import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentDTO } from '../../types/document';
import * as documentApi from '../../api/documentApi';

// Define the state interface
interface DocumentState {
  documents: DocumentDTO[];
  currentDocument: DocumentDTO | null;
  loading: boolean;
  error: string | null;
}

// Initial state
const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  loading: false,
  error: null
};

// Async thunks
export const fetchProjectDocuments = createAsyncThunk(
  'documents/fetchProjectDocuments',
  async (projectId: number, { rejectWithValue }) => {
    try {
      return await documentApi.getProjectDocuments(projectId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch project documents');
    }
  }
);

export const fetchFolderDocuments = createAsyncThunk(
  'documents/fetchFolderDocuments',
  async (folderId: number, { rejectWithValue }) => {
    try {
      return await documentApi.getFolderDocuments(folderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch folder documents');
    }
  }
);

export const fetchDocumentById = createAsyncThunk(
  'documents/fetchDocumentById',
  async (documentId: number, { rejectWithValue }) => {
    try {
      return await documentApi.getDocumentById(documentId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch document');
    }
  }
);

export const searchDocuments = createAsyncThunk(
  'documents/searchDocuments',
  async ({ projectId, query }: { projectId: number; query: string }, { rejectWithValue }) => {
    try {
      return await documentApi.searchDocuments(projectId, query);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to search documents');
    }
  }
);

// Create the slice
const documentSlice = createSlice({
  name: 'documents',
  initialState,
  reducers: {
    clearDocuments: (state) => {
      state.documents = [];
    },
    clearCurrentDocument: (state) => {
      state.currentDocument = null;
    }
  },
  extraReducers: (builder) => {
    // fetchProjectDocuments
    builder.addCase(fetchProjectDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchProjectDocuments.fulfilled, (state, action: PayloadAction<DocumentDTO[]>) => {
      state.loading = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchProjectDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchFolderDocuments
    builder.addCase(fetchFolderDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchFolderDocuments.fulfilled, (state, action: PayloadAction<DocumentDTO[]>) => {
      state.loading = false;
      state.documents = action.payload;
    });
    builder.addCase(fetchFolderDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // fetchDocumentById
    builder.addCase(fetchDocumentById.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(fetchDocumentById.fulfilled, (state, action: PayloadAction<DocumentDTO>) => {
      state.loading = false;
      state.currentDocument = action.payload;
    });
    builder.addCase(fetchDocumentById.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });

    // searchDocuments
    builder.addCase(searchDocuments.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(searchDocuments.fulfilled, (state, action: PayloadAction<DocumentDTO[]>) => {
      state.loading = false;
      state.documents = action.payload;
    });
    builder.addCase(searchDocuments.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// Export actions and reducer
export const { clearDocuments, clearCurrentDocument } = documentSlice.actions;
export default documentSlice.reducer; 