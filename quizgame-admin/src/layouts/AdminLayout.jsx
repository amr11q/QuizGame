import { Outlet, Navigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AdminLayout() {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (!token || role !== "Admin") {
        return <Navigate to="/admin/login" />;
    }

    return (
        <div style={{ display: "flex" }}>
            <Navbar />
            <div style={{ padding: "20px", width: "100%" }}>
                <Outlet />
            </div>
        </div>
    );
}