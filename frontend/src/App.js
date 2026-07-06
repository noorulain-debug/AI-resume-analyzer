import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Register from './pages/Register';
import Analyze from './pages/Analyze';
import History from './pages/History';
import './index.css';

// PrivateRoute: if user is not logged in, redirect to /login
const PrivateRoute = ({ children }) => {
  const { token } = useAuth();
  return token ? children : <Navigate to="/login" replace />;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Navigate to="/analyze" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/analyze"
          element={<PrivateRoute><Analyze /></PrivateRoute>}
        />
        <Route
          path="/history"
          element={<PrivateRoute><History /></PrivateRoute>}
        />
        {/* Catch any unknown URL */}
        <Route path="*" element={<Navigate to="/analyze" replace />} />
      </Routes>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppRoutes />
      </Router>
    </AuthProvider>
  );
}

export default App;
