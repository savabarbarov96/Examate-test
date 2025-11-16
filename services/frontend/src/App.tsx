import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";

import AllUsersPage from "@/components/pages/AllUsers";
import LoginPage from "@/components/pages/Auth";
import DashboardPage from "./components/pages/Dashboard";
import ForgotPasswordPage from "./components/pages/ForgotPassword";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import ChangePasswordPage from "./components/pages/ChangePassword";
import CreateUserPage from "./components/pages/CreateUser";
import AllUserRolesPage from "./components/pages/AllUserRoles";
import SidebarLayout from "./layouts/SidebarLayout";
import ProfilePage from "./components/UserProfile";
import AuthGate from "./components/auth/AuthGate";
import StatisticsPage from "./components/pages/Statistics";
import ExamListPage from "./components/pages/ExamList";
import ExamCreatePage from "./components/pages/ExamCreate";
import ExamTakePage from "./components/pages/ExamTake";
import ExamResultsPage from "./components/pages/ExamResults";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AuthGate>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route element={<SidebarLayout />}>
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/statistics" element={<StatisticsPage />} />
                <Route path="/exams" element={<ExamListPage />} />
                <Route path="/exams/create" element={<ExamCreatePage />} />
                <Route path="/exams/:id/edit" element={<ExamCreatePage />} />
                <Route path="/all-users" element={<AllUsersPage />} />
                <Route path="/create-user" element={<CreateUserPage />} />
                <Route path="/all-roles" element={<AllUserRolesPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                <Route path="/users/:id/edit" element={<ProfilePage />} />
              </Route>
              {/* Exam taking has its own layout (no sidebar) */}
              <Route path="/exams/:id/take" element={<ExamTakePage />} />
              <Route path="/exams/:id/results" element={<ExamResultsPage />} />
            </Route>

            <Route path="/" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/change-password" element={<ChangePasswordPage />} />
          </Routes>
        </AuthGate>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
