// frontend-admin/src/App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminLayout from './components/layout/AdminLayout';
import Dashboard from './pages/Dashboard';
import Complaints from './pages/Complaints';
import PendingReview from './pages/PendingReview';
import Officers from './pages/Officers';
import ComplaintDetails from './pages/ComplaintDetails';
import Login from './pages/Login';
import { getCurrentUser } from './services/adminService';
import './App.css';

// Protected route wrapper
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const user = getCurrentUser();
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* Public route */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AdminLayout>
                <Routes>
                  <Route path="/" element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/complaints" element={<Complaints />} />
                  <Route path="/pending" element={<PendingReview />} />
                  <Route path="/officers" element={<Officers />} />
                  <Route path="/complaint/:id" element={<ComplaintDetails />} />
                </Routes>
              </AdminLayout>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;

