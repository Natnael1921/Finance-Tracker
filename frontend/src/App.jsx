import { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import ProtectedRoute from './components/ProtectedRoute';
import SplashScreen from './components/SplashScreen';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import AddTransaction from './pages/AddTransaction';
import Users from './pages/Users';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);

  return (
    <>
      {/* Splash — shows once on first load, then fades away */}
      {!splashDone && <SplashScreen onDone={() => setSplashDone(true)} />}

      {/* Main app — renders underneath but hidden until splash exits */}
      <div style={{ opacity: splashDone ? 1 : 0, transition: 'opacity 0.4s ease-in' }}>
        <BrowserRouter>
          <AuthProvider>
            <SocketProvider>
              <Routes>
                {/* Public */}
                <Route path="/login" element={<Login />} />

                {/* Protected */}
                <Route path="/dashboard" element={
                  <ProtectedRoute><Dashboard /></ProtectedRoute>
                } />
                <Route path="/transactions" element={
                  <ProtectedRoute><Transactions /></ProtectedRoute>
                } />
                <Route path="/add-transaction" element={
                  <ProtectedRoute><AddTransaction /></ProtectedRoute>
                } />
                <Route path="/users" element={
                  <ProtectedRoute requireSuperAdmin><Users /></ProtectedRoute>
                } />

                {/* Redirects */}
                <Route path="/" element={<Navigate to="/dashboard" replace />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
              </Routes>
            </SocketProvider>
          </AuthProvider>
        </BrowserRouter>
      </div>
    </>
  );
}
