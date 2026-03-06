import { Navigate } from "react-router-dom";

export default function AdminGuard({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token) {
    return <Navigate to="/admin/login" />;
  }

  if (role !== "Admin") {
    return <Navigate to="/admin/login" />;
  }

  return children;
}