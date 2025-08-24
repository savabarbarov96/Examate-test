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

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route
            path="/dashboard"
            element={
              <ProtectedRoute>
                <DashboardPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/all-users"
            element={
              <ProtectedRoute>
                <AllUsersPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/create-user"
            element={
              <ProtectedRoute>
                <CreateUserPage />
              </ProtectedRoute>
            }
          />

          <Route
            path="/all-roles"
            element={
              <ProtectedRoute>
                <AllUserRolesPage />
              </ProtectedRoute>
            }
          />

          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          {/* 
<Route path="/update-user:id" element={<ChangePasswordPage />} /> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
