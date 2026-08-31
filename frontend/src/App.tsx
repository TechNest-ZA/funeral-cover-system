import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { OwnerRoute } from './components/OwnerRoute';
import { AdminLayout } from './components/AdminLayout';
import { SignupPage } from './pages/signup/SignupPage';
import { DetailsPage } from './pages/signup/DetailsPage';
import { PaymentPage } from './pages/signup/PaymentPage';
import { ConfirmationPage } from './pages/signup/ConfirmationPage';
import { MemberBookPage } from './pages/signup/MemberBookPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';
import { TodayPage } from './pages/admin/TodayPage';
import { MembersListPage } from './pages/admin/MembersListPage';
import { MemberDetailPage } from './pages/admin/MemberDetailPage';
import { AddMemberPage } from './pages/admin/AddMemberPage';
import { StaffPage } from './pages/admin/StaffPage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/join" replace />} />
          <Route path="/join" element={<SignupPage />} />
          <Route path="/join/details" element={<DetailsPage />} />
          <Route path="/join/:memberId/pay" element={<PaymentPage />} />
          <Route path="/join/:memberId/confirmation" element={<ConfirmationPage />} />
          <Route path="/book/:token" element={<MemberBookPage />} />

          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <TodayPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <MembersListPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members/new"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <AddMemberPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/members/:id"
            element={
              <ProtectedRoute>
                <AdminLayout>
                  <MemberDetailPage />
                </AdminLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/staff"
            element={
              <OwnerRoute>
                <AdminLayout>
                  <StaffPage />
                </AdminLayout>
              </OwnerRoute>
            }
          />

          <Route path="*" element={<Navigate to="/join" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
