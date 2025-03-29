import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
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
import NotFound from './pages/NotFound';

// Componente wrapper para manejar el scroll y verificación de rutas
const RouteHandler = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();

  useEffect(() => {
    // Scroll al inicio al cambiar de ruta
    window.scrollTo(0, 0);

    // Opcional: Verificación de rutas válidas (puedes personalizar según necesidades)
    const validPaths = [
      '/',
      '/privacy',
      '/login/empleado',
      '/login/empresa',
      '/login/supervisor',
      '/login/inspector',
      '/login/supervisor/centro',
      '/register/empleado',
      '/register/empresa',
      '/empleado',
      '/empresa',
      '/supervisor/centro',
      '/inspector'
    ];

    // Verifica si la ruta base coincide con alguna ruta válida
    const isValidPath = validPaths.some(path => 
      location.pathname === path || 
      location.pathname.startsWith(path + '/')
    );

    if (!isValidPath && location.pathname !== '/') {
      // Si necesitas redirigir a NotFound automáticamente
      // Esto es opcional ya que ya tienes la ruta * que maneja NotFound
    }
  }, [location]);

  return <>{children}</>;
};

function App() {
  return (
    <UserProvider>
      <CompanyProvider>
        <Router>
          <RouteHandler>
            <Routes>
              {/* Ruta principal */}
              <Route path="/" element={<Home />} />

              {/* Ruta de privacidad */}
              <Route path="/privacy" element={<Privacy />} />

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

              {/* Ruta 404 */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </RouteHandler>
        </Router>
      </CompanyProvider>
    </UserProvider>
  );
}

export default App;
