import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// Mock the theme and store
vi.mock('./theme', () => ({
  default: {
    palette: {
      primary: { main: '#000' },
      secondary: { main: '#000' },
      error: { main: '#000' },
      warning: { main: '#000' },
      info: { main: '#000' },
      success: { main: '#000' },
      background: { default: '#fff', paper: '#fff' },
    },
    typography: {
      fontFamily: 'Roboto',
      h1: { fontWeight: 500 },
      h2: { fontWeight: 500 },
      h3: { fontWeight: 500 },
      h4: { fontWeight: 500 },
      h5: { fontWeight: 500 },
      h6: { fontWeight: 500 },
      fontWeightBold: 700,
      fontWeightMedium: 500,
      fontWeightRegular: 400,
      fontWeightLight: 300,
    },
    components: {
      MuiButton: { styleOverrides: { root: {} } },
      MuiCard: { styleOverrides: { root: {} } },
    },
  },
}));

vi.mock('./redux/store', () => ({
  store: {
    getState: vi.fn(),
    dispatch: vi.fn(),
    subscribe: vi.fn(),
  },
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByText(/Home Page/i)).toBeInTheDocument();
  });
}); 