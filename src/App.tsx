import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { UserProvider } from './context/UserContext';
import { CompanyProvider } from './context/CompanyContext';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import EmployeeDashboard from './pages/EmployeeDashboard';
import CompanyDashboard from './pages/CompanyDashboard';
import SupervisorDashboard from './pages/SupervisorDashboard';
import InspectorDashboard from './pages/InspectorDashboard';
import Privacy from './pages/Privacy';

function App() {
  return (
    <UserProvider>
      <CompanyProvider>
        <Router>
          <Routes>
            {/* Ruta principal */}
            <Route path="/" element={<Home />} />

            {/* Rutas de login */}
            <Route path="/login/:portal" element={<Login />} />
            <Route path="/login/supervisor/centro" element={<Login />} />

            {/* Rutas de registro */}
            <Route path="/register/:portal" element={<Register />} />

            {/* Rutas de dashboards */}
            <Route path="/empleado/*" element={<EmployeeDashboard />} />
            <Route path="/empresa/*" element={<CompanyDashboard />} />
            <Route path="/supervisor/centro/*" element={<SupervisorDashboard />} />
            <Route path="/inspector/*" element={<InspectorDashboard />} />

            {/* Ruta de privacidad */}
            <Route path="/privacy" element={<Privacy />} />
          </Routes>
        </Router>
      </CompanyProvider>
    </UserProvider>
  );
}

export default App;
