import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { DocumentDTO } from '../../types/document';
import * as documentApi from '../../api/documentApi';

// Define the state interface
interface DocumentState {
  documents: DocumentDTO[];
  currentDocument: DocumentDTO | null;
  loading: boolean;
  uploading: boolean;
  error: string | null;
  uploadSuccess: boolean;
}

// Initial state
const initialState: DocumentState = {
  documents: [],
  currentDocument: null,
  loading: false,
  uploading: false,
  error: null,
  uploadSuccess: false
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

export const uploadDocument = createAsyncThunk(
  'documents/uploadDocument',
  async (
    { name, projectId, file, folderId }: 
    { name: string; projectId: number; file: File; folderId?: number },
    { rejectWithValue }
  ) => {
    try {
      return await documentApi.uploadDocument(name, projectId, file, folderId);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload document');
    }
  }
);

export const deleteDocument = createAsyncThunk(
  'documents/deleteDocument',
  async (documentId: number, { rejectWithValue }) => {
    try {
      await documentApi.deleteDocument(documentId);
      return documentId;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete document');
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
    },
    resetUploadState: (state) => {
      state.uploading = false;
      state.uploadSuccess = false;
      state.error = null;
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
    
    // uploadDocument
    builder.addCase(uploadDocument.pending, (state) => {
      state.uploading = true;
      state.uploadSuccess = false;
      state.error = null;
    });
    builder.addCase(uploadDocument.fulfilled, (state, action: PayloadAction<DocumentDTO>) => {
      state.uploading = false;
      state.uploadSuccess = true;
      state.documents = [...state.documents, action.payload];
    });
    builder.addCase(uploadDocument.rejected, (state, action) => {
      state.uploading = false;
      state.uploadSuccess = false;
      state.error = action.payload as string;
    });

    // deleteDocument
    builder.addCase(deleteDocument.pending, (state) => {
      state.loading = true;
      state.error = null;
    });
    builder.addCase(deleteDocument.fulfilled, (state, action: PayloadAction<number>) => {
      state.loading = false;
      state.documents = state.documents.filter(doc => doc.id !== action.payload);
      if (state.currentDocument && state.currentDocument.id === action.payload) {
        state.currentDocument = null;
      }
    });
    builder.addCase(deleteDocument.rejected, (state, action) => {
      state.loading = false;
      state.error = action.payload as string;
    });
  }
});

// Export actions and reducer
export const { clearDocuments, clearCurrentDocument, resetUploadState } = documentSlice.actions;
export default documentSlice.reducer; 