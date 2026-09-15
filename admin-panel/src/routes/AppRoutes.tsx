import { Routes, Route } from 'react-router-dom';
import { AppLayout } from '@/layouts/AppLayout';
import { ProtectedRoute } from './ProtectedRoute';
import LoginPage from '@/pages/Auth/LoginPage';
import DashboardPage from '@/pages/Dashboard/DashboardPage';
import NewsPage from '@/pages/News/NewsPage';
import SubmissionsPage from '@/pages/Submissions/SubmissionsPage';
import UsersPage from '@/pages/Users/UsersPage';
import CreditsPage from '@/pages/Credits/CreditsPage';
import NotificationsPage from '@/pages/Notifications/NotificationsPage';
import SettingsPage from '@/pages/Settings/SettingsPage';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
        <Route path="/" element={<DashboardPage />} />
        <Route path="/news" element={<NewsPage />} />
        <Route path="/submissions" element={<SubmissionsPage />} />
        <Route path="/users" element={<UsersPage />} />
        <Route path="/credits" element={<CreditsPage />} />
        <Route path="/notifications" element={<NotificationsPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
};
export default AppRoutes;