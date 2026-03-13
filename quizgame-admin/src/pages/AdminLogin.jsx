import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import "./AdminLogin.css";

function AdminLogin() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const res = await api.post("/auth/login", {
                email,
                password,
            });

            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            if (res.data.role !== "Admin") {
                setError("أنت مش Admin");
                return;
            }

            navigate("/admin/dashboard");

        } catch (err) {

            setError(
                err.response?.data?.message || "Email أو Password غلط"
            );

        }
    };

    return (

        <div className="admin-login-container">

            <h2>Admin Login</h2>

            <form onSubmit={handleLogin}>

                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <button type="submit">Login</button>

            </form>

            {error && <p className="error">{error}</p>}

        </div>

    );

}

export default AdminLogin;