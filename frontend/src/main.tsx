import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './styles/shared/index.css';
import { store } from './redux/store';
import { initializeAuth } from './redux/slices/authSlice';

// Initialize authentication state before rendering
store.dispatch(initializeAuth());

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
