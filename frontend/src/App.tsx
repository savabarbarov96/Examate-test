// import { useState } from 'react'
import { BrowserRouter, Routes, Route } from "react-router";

import "./App.css";

import LoginPage from "@/components/pages/Auth";
import DashboardPage from "./components/pages/Dashboard";
import ForgotPasswordPage from "./components/pages/ForgotPassword";
import ResetPasswordPage from "./components/pages/ResetPassword";

function App() {
  // const [count, setCount] = useState(0)

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/dashboard" element={<DashboardPage />} />
        {/* <Route path="about" element={<About />} /> */}

        <Route path="/" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
        {/* <Route path="concerts">
          <Route index element={<ConcertsHome />} />
          <Route path=":city" element={<City />} />
          <Route path="trending" element={<Trending />} />
        </Route> */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;
