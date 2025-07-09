import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { Provider } from 'react-redux';
import { store } from './redux/store';
import { createTheme } from '@mui/material';

const theme = createTheme();

// Import pages when they are created
// import HomePage from './pages/HomePage';
// import LoginPage from './pages/LoginPage';
// import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Router>
          <Routes>
            {/* Define routes when pages are created */}
            <Route path="/" element={<div>Home Page</div>} />
            <Route path="/login" element={<div>Login Page</div>} />
            <Route path="*" element={<div>Not Found</div>} />
          </Routes>
        </Router>
      </ThemeProvider>
    </Provider>
  );
}

export default App;
