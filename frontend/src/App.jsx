import { Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import RoleRedirect from './components/RoleRedirect';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Groups from './pages/Groups';
import GroupDetail from './pages/GroupDetail';
import Assignments from './pages/Assignments';
import AdminAssignments from './pages/AdminAssignments';
import AdminAnalytics from './pages/AdminAnalytics';
import AdminGroups from './pages/AdminGroups';
import AdminStudents from './pages/AdminStudents';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student workspace */}
      <Route element={<ProtectedRoute allowedRoles={['student']} />}>
        <Route element={<Layout />}>
          <Route path="/student/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/assignments" element={<Assignments />} />
        </Route>
      </Route>

      {/* Professor workspace */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<Dashboard />} />
          <Route path="/admin/assignments" element={<AdminAssignments />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/groups" element={<AdminGroups />} />
          <Route path="/admin/students" element={<AdminStudents />} />
        </Route>
      </Route>

      <Route path="/dashboard" element={<RoleRedirect />} />
      <Route path="*" element={<RoleRedirect />} />
    </Routes>
  );
}
