import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from './components/AppShell';
import { CalculatorWorkspace } from './components/CalculatorWorkspace';
import { ProtectedRoute } from './components/ProtectedRoute';
import { AdminPanelView } from './views/AdminPanelView';
import { LoginPage } from './views/LoginPage';
import { PendingApprovalPage } from './views/PendingApprovalPage';
import { ProjectsView } from './views/ProjectsView';
import { RegisterPage } from './views/RegisterPage';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/pending"
        element={
          <ProtectedRoute requireApproved={false}>
            <PendingApprovalPage />
          </ProtectedRoute>
        }
      />

      <Route
        element={
          <ProtectedRoute>
            <AppShell />
          </ProtectedRoute>
        }
      >
        <Route path="/dashboard" element={<CalculatorWorkspace />} />
        <Route path="/projects" element={<ProjectsView />} />
        <Route
          path="/admin"
          element={
            <ProtectedRoute requireRoles={['MasterAdmin', 'Admin']}>
              <AdminPanelView />
            </ProtectedRoute>
          }
        />
      </Route>

      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
