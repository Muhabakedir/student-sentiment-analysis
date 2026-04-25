import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Layout from "./components/layout/Layout";

import Landing from "./pages/Landing";
import Login from "./pages/Login";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import StudentRegister from "./pages/StudentRegister";
import StudentForgotPassword from "./pages/StudentForgotPassword";
import StudentResetPassword from "./pages/StudentResetPassword";
import AdminActivate from "./pages/AdminActivate";
import StudentPortal from "./pages/StudentPortal";
import StudentHistory from "./pages/StudentHistory";
import Dashboard from "./pages/Dashboard";
import Services from "./pages/Services";
import Feedback from "./pages/Feedback";
import Themes from "./pages/Themes";
import Recommendations from "./pages/Recommendations";
import AdminUsers from "./pages/AdminUsers";

// Protect admin dashboard — redirect to login if not authenticated
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/login" replace />;
}

// Protect student pages — redirect to login if no student session
function StudentRoute({ children }) {
  const student = sessionStorage.getItem("student");
  return student ? children : <Navigate to="/login" replace />;
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />

      {/* Legacy login routes — redirect to unified login */}
      <Route path="/admin/login" element={<Navigate to="/login" replace />} />
      <Route path="/admin/forgot-password" element={<ForgotPassword />} />
      <Route path="/admin/reset-password" element={<ResetPassword />} />
      <Route path="/admin/activate" element={<AdminActivate />} />
      <Route path="/student/login" element={<Navigate to="/login" replace />} />
      <Route path="/student/register" element={<StudentRegister />} />
      <Route path="/student/forgot-password" element={<StudentForgotPassword />} />
      <Route path="/student/reset-password" element={<StudentResetPassword />} />

      {/* Student portal (protected) */}
      <Route path="/student/portal" element={<StudentRoute><StudentPortal /></StudentRoute>} />
      <Route path="/student/history" element={<StudentRoute><StudentHistory /></StudentRoute>} />

      {/* Admin dashboard (protected) */}
      <Route path="/dashboard" element={
        <ProtectedRoute><Layout /></ProtectedRoute>
      }>
        <Route index element={<Dashboard />} />
        <Route path="services" element={<Services />} />
        <Route path="feedback" element={<Feedback />} />
        <Route path="themes" element={<Themes />} />
        <Route path="recommendations" element={<Recommendations />} />
        <Route path="users" element={<AdminUsers />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <AppRoutes />
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
