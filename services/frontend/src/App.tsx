// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";

import "./App.css";

import LoginPage from "@/components/pages/Auth";
import DashboardPage from "./components/pages/Dashboard";
import ForgotPasswordPage from "./components/pages/ForgotPassword";
import { AuthProvider } from "./contexts/AuthProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import ChangePasswordPage from "./components/pages/ChangePassword";

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
          {/* <Route path="about" element={<About />} /> */}

          <Route path="/" element={<LoginPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/change-password" element={<ChangePasswordPage />} />
          {/* <Route path="concerts">
          <Route index element={<ConcertsHome />} />
          <Route path=":city" element={<City />} />
          <Route path="trending" element={<Trending />} />
        </Route> */}
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}

export default App;
