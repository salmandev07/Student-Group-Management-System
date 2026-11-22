import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
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
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Student + shared routes */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/groups/:id" element={<GroupDetail />} />
          <Route path="/assignments" element={<Assignments />} />
        </Route>
      </Route>

      {/* Professor-only routes */}
      <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/assignments" element={<AdminAssignments />} />
          <Route path="/admin/analytics" element={<AdminAnalytics />} />
          <Route path="/admin/groups" element={<AdminGroups />} />
          <Route path="/admin/students" element={<AdminStudents />} />
        </Route>
      </Route>

      <Route path="/" element={<Landing />} />
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
