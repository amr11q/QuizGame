import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "./Login.css";

export default function Login() {

    const navigate = useNavigate();

    const [mode, setMode] = useState("login");

    const [form, setForm] = useState({
        email: "",
        password: "",
        name: ""
    });

    const [error, setError] = useState("");

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const submit = async (e) => {
        e.preventDefault();
        setError("");

        try {

            const url = mode === "login" ? "/auth/login" : "/users/register";

            const payload =
                mode === "login"
                    ? { email: form.email, password: form.password }
                    : form;

            const res = await api.post(url, payload);

            if (mode === "login") {

                // حفظ التوكن
                localStorage.setItem("token", res.data.token);

                // 🧹 مسح أي تايمر امتحان قديم
                Object.keys(localStorage).forEach(key => {
                    if (key.startsWith("exam_end_")) {
                        localStorage.removeItem(key);
                    }
                });

                // الانتقال للداشبورد
                navigate("/dashboard");

            } else {
                setMode("login");
            }

        } catch (err) {
            setError("Login failed");
        }

    };

    return (

        <div className="login-page">

            <div className="login-card">

                <h2>QuizGame</h2>

                <p className="subtitle">
                    Sign in to continue the competition
                </p>

                <form onSubmit={submit}>

                    {mode === "register" && (

                        <input
                            type="text"
                            name="name"
                            placeholder="Your name"
                            onChange={handleChange}
                            required
                        />

                    )}

                    <input
                        type="email"
                        name="email"
                        placeholder="Email"
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="password"
                        placeholder="Password"
                        onChange={handleChange}
                        required
                    />

                    {error && <p className="error">{error}</p>}

                    <button type="submit">

                        {mode === "login" ? "Login" : "Register"}

                    </button>

                </form>

                <p className="switch">

                    {mode === "login"
                        ? "No account?"
                        : "Already have account?"}

                    <span
                        onClick={() => setMode(mode === "login" ? "register" : "login")}
                    >

                        {mode === "login" ? " Register" : " Login"}

                    </span>

                </p>

            </div>

        </div>

    );

}