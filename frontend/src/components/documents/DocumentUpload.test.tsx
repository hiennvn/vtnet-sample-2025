import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import DocumentUpload from './DocumentUpload';
import { uploadDocument } from '../../redux/slices/documentSlice';

// Mock redux-thunk
const middlewares = [thunk];
const mockStore = configureStore(middlewares);

// Mock the uploadDocument action
jest.mock('../../redux/slices/documentSlice', () => ({
  uploadDocument: jest.fn(),
  resetUploadState: jest.fn()
}));

describe('DocumentUpload Component', () => {
  let store: any;
  
  beforeEach(() => {
    store = mockStore({
      documents: {
        uploading: false,
        uploadSuccess: false,
        error: null
      }
    });
    
    // Reset mocks
    jest.clearAllMocks();
  });

  it('renders the upload form correctly', () => {
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} />
      </Provider>
    );
    
    expect(screen.getByText('Upload Document')).toBeInTheDocument();
    expect(screen.getByLabelText('Document Name')).toBeInTheDocument();
    expect(screen.getByText('Drag & drop a file here or click to browse')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Upload Document' })).toBeInTheDocument();
  });

  it('shows validation error when submitting without a name', async () => {
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} />
      </Provider>
    );
    
    // Create a file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    const fileInput = screen.getByRole('button', { name: 'Upload Document' }).previousSibling;
    
    // Submit without a name
    fireEvent.click(screen.getByRole('button', { name: 'Upload Document' }));
    
    expect(screen.getByText('Document name is required')).toBeInTheDocument();
    expect(uploadDocument).not.toHaveBeenCalled();
  });

  it('shows validation error when submitting without a file', async () => {
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} />
      </Provider>
    );
    
    // Enter a name but no file
    fireEvent.change(screen.getByLabelText('Document Name'), { target: { value: 'Test Document' } });
    
    // Submit without a file
    fireEvent.click(screen.getByRole('button', { name: 'Upload Document' }));
    
    expect(screen.getByText('Please select a file to upload')).toBeInTheDocument();
    expect(uploadDocument).not.toHaveBeenCalled();
  });

  it('dispatches uploadDocument action when form is valid', async () => {
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} />
      </Provider>
    );
    
    // Create a mock file
    const file = new File(['dummy content'], 'test.pdf', { type: 'application/pdf' });
    
    // Mock file selection
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    Object.defineProperty(fileInput, 'files', {
      value: [file]
    });
    fireEvent.change(fileInput);
    
    // Enter a name
    fireEvent.change(screen.getByLabelText('Document Name'), { target: { value: 'Test Document' } });
    
    // Submit the form
    fireEvent.click(screen.getByRole('button', { name: 'Upload Document' }));
    
    expect(uploadDocument).toHaveBeenCalledWith({
      name: 'Test Document',
      projectId: 1,
      file,
      folderId: 2
    });
  });

  it('shows loading state during upload', () => {
    store = mockStore({
      documents: {
        uploading: true,
        uploadSuccess: false,
        error: null
      }
    });
    
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} />
      </Provider>
    );
    
    expect(screen.getByRole('button', { name: 'Uploading...' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Uploading...' })).toBeDisabled();
  });

  it('shows success message after upload completes', () => {
    store = mockStore({
      documents: {
        uploading: false,
        uploadSuccess: true,
        error: null
      }
    });
    
    const onUploadComplete = jest.fn();
    
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} onUploadComplete={onUploadComplete} />
      </Provider>
    );
    
    expect(screen.getByText('Document uploaded successfully!')).toBeInTheDocument();
    expect(onUploadComplete).toHaveBeenCalled();
  });

  it('shows error message when upload fails', () => {
    store = mockStore({
      documents: {
        uploading: false,
        uploadSuccess: false,
        error: 'Failed to upload document'
      }
    });
    
    render(
      <Provider store={store}>
        <DocumentUpload projectId={1} folderId={2} />
      </Provider>
    );
    
    expect(screen.getByText('Failed to upload document')).toBeInTheDocument();
  });
}); 