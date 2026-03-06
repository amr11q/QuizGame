import { Link, useNavigate } from "react-router-dom";

export default function Navbar() {
    const navigate = useNavigate();

    const logout = () => {
        localStorage.clear();
        navigate("/admin/login");
    };

    return (
        <div style={{
            width: "220px",
            minHeight: "100vh",
            background: "#111",
            color: "#fff",
            padding: "20px"
        }}>
            <h3>Admin Panel</h3>

            <ul style={{ listStyle: "none", padding: 0 }}>
                <li><Link to="/admin/dashboard">Dashboard</Link></li>
                <li><Link to="/admin/quizzes">Quizzes</Link></li>
                <li><Link to="/admin/questions">Questions</Link></li>
            </ul>

            <button onClick={logout} style={{ marginTop: "20px" }}>
                Logout
            </button>
        </div>
    );
}