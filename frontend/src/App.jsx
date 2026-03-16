import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./Login";
import Register from "./Register";
import ForgotPassword from "./ForgotPassword";
import Landing_page from "./Landing_page";
import AdminDashboard from "./AdminDashboard";
import PetOwnerDashboard from "./PetOwnerDashboard";
import Cart from "./Cart";
import Checkout from "./Checkout";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const Dashboard = PetOwnerDashboard;

function ProtectedRoute({ children, requiredRole }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/login" replace />;
  }

  // Normalize role from backend like ROLE_ADMIN → ADMIN
  const normalizedRole = role
    ? role.replace("ROLE_", "").toUpperCase()
    : null;

  if (requiredRole && normalizedRole !== requiredRole) {
    if (normalizedRole === "ADMIN") {
      return <Navigate to="/admin" replace />;
    } else {
      return <Navigate to="/dashboard" replace />;
    }
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastContainer position="top-right" autoClose={3000} />

      <Routes>
        <Route path="/" element={<Landing_page />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* ADMIN ROUTE */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute requiredRole="ADMIN">
              <AdminDashboard />
            </ProtectedRoute>
          }
        />

        {/* PET OWNER DASHBOARD */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute requiredRole="PET_OWNER">
              <Dashboard />
            </ProtectedRoute>
          }
        />

        {/* CART */}
        <Route
          path="/cart"
          element={
            <ProtectedRoute requiredRole="PET_OWNER">
              <Cart />
            </ProtectedRoute>
          }
        />

        {/* CHECKOUT */}
        <Route
          path="/checkout"
          element={
            <ProtectedRoute requiredRole="PET_OWNER">
              <Checkout />
            </ProtectedRoute>
          }
        />

        {/* FALLBACK */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}