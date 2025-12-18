import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Login } from './pages/Login';
import { AuthCallback } from './pages/AuthCallback';
import { Dashboard } from './pages/Dashboard';
import { ExpressionsList } from './pages/ExpressionsList';
import { CreateExpression } from './pages/CreateExpression';
import EditExpression from './pages/EditExpression';
import ChangeStatus from './pages/ChangeStatus';
import { ExpressionDetail } from './pages/ExpressionDetail';
import { ValidateExpression } from './pages/ValidateExpression';
import { BonCommandeDetail } from './pages/BonCommandeDetail';
import Profile from './pages/Profile';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminUsers from './pages/admin/AdminUsers';
import AdminDivisions from './pages/admin/AdminDivisions';
import AdminServices from './pages/admin/AdminServices';
import AdminExpressions from './pages/admin/AdminExpressions';
import AdminMatieres from './pages/admin/AdminMatieres';
import AdminBonsCommande from './pages/admin/AdminBonsCommande';
import AdminFournisseurs from './pages/admin/AdminFournisseurs';
import AdminReceptions from './pages/admin/AdminReceptions';
import ReceptionBonCommande from './pages/ReceptionBonCommande';
import PVReception from './pages/PVReception';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <NotificationProvider>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/callback" element={<AuthCallback />} />
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <Dashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expressions"
            element={
              <ProtectedRoute>
                <ExpressionsList />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expressions/create"
            element={
              <ProtectedRoute>
                <CreateExpression />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expressions/:id/edit"
            element={
              <ProtectedRoute>
                <EditExpression />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expressions/:id/status"
            element={
              <ProtectedRoute>
                <ChangeStatus />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expressions/:id"
            element={
              <ProtectedRoute>
                <ExpressionDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/expressions/validate"
            element={
              <ProtectedRoute>
                <ValidateExpression />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bon-commande/:id"
            element={
              <ProtectedRoute>
                <BonCommandeDetail />
              </ProtectedRoute>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/users"
            element={
              <ProtectedRoute>
                <AdminUsers />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/divisions"
            element={
              <ProtectedRoute>
                <AdminDivisions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/services"
            element={
              <ProtectedRoute>
                <AdminServices />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/expressions"
            element={
              <ProtectedRoute>
                <AdminExpressions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/matieres"
            element={
              <ProtectedRoute>
                <AdminMatieres />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/bons-commande"
            element={
              <ProtectedRoute>
                <AdminBonsCommande />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/fournisseurs"
            element={
              <ProtectedRoute>
                <AdminFournisseurs />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/receptions"
            element={
              <ProtectedRoute>
                <AdminReceptions />
              </ProtectedRoute>
            }
          />
          <Route
            path="/bons-commande/:id/reception"
            element={
              <ProtectedRoute>
                <ReceptionBonCommande />
              </ProtectedRoute>
            }
          />
          <Route
            path="/receptions/:id/pv"
            element={
              <ProtectedRoute>
                <PVReception />
              </ProtectedRoute>
            }
          />
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
        </NotificationProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
