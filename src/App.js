// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute';
import LoginAdmins from './components/LoginAdmins';
import RegistroAdmins from './components/RegistroAdmins';
import AdminDashboard from './components/AdminDashboard';
import SplashScreen from './components/SplashScreen';

const App = () => {
  return (
    <Router>
      <div>
        <Routes>
        <Route path="/" element={<SplashScreen />} />
          <Route path="/login-admins" element={<LoginAdmins />} />
          <Route path="/admin-dashboard" element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } />
          <Route path="/registro-admins" element={<RegistroAdmins />} />
          <Route path="*" element={<LoginAdmins />} />
        </Routes>
       
      </div>
    </Router>
  );
};
export default App;
