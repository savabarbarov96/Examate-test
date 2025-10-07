import { BrowserRouter, Routes, Route } from "react-router";
import "./App.css";

import AllUsersPage from "@/components/pages/AllUsers";
import LoginPage from "@/components/pages/Auth";
import DashboardPage from "./components/pages/Dashboard";
import ForgotPasswordPage from "./components/pages/ForgotPassword";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePasswordPage from "./components/pages/ChangePassword";
import CreateUserPage from "./components/pages/CreateUser";
import AllUserRolesPage from "./components/pages/AllUserRoles";
import SidebarLayout from "./layouts/SidebarLayout";
import ProfilePage from "./components/UserProfile";

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route element={<ProtectedRoute />}>
            <Route element={<SidebarLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/all-users" element={<AllUsersPage />} />
              <Route path="/create-user" element={<CreateUserPage />} />
              <Route path="/all-roles" element={<AllUserRolesPage />} />
              <Route path="/profile" element={<ProfilePage />} />
            </Route>
          </Route>

          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
