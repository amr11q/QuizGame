import { useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

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

            // حفظ التوكن
            localStorage.setItem("token", res.data.token);
            localStorage.setItem("role", res.data.role);

            // تأكيد إنه Admin
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
        <div style={{ maxWidth: "400px", margin: "100px auto" }}>
            <h2>Admin Login</h2>

            <form onSubmit={handleLogin}>
                <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />

                <br /><br />

                <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                />

                <br /><br />

                <button type="submit">Login</button>
            </form>

            {error && <p style={{ color: "red" }}>{error}</p>}
        </div>
    );
}

export default AdminLogin;