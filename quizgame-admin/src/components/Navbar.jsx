import { Link, useNavigate } from "react-router-dom";
import "./AdminSidebar.css";

export default function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/admin/login");
    };

    return (
        <div className="admin-navbar">

            <div className="nav-left">
                <h3>Admin Panel</h3>

                <div className="nav-links">
                    <Link to="/admin/dashboard">Dashboard</Link>
                    <Link to="/admin/quizzes">Quizzes</Link>
                </div>
            </div>

            <button onClick={logout} className="logout-btn">
                Logout
            </button>

        </div>
    );
}