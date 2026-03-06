import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";

export default function AdminDashboard() {
    const navigate = useNavigate(); // ✅ جوه الكومبوننت

    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/admin/stats")
            .then(res => setStats(res.data))
            .catch(() => alert("❌ فشل تحميل الإحصائيات"));
    }, []);

    const resetWeekly = async () => {
        try {

            await api.post("/leaderboard/reset-weekly");

            alert("تم تصفير نقاط الأسبوع");

        } catch {
            alert("فشل تصفير نقاط الأسبوع");
        }
    };

    if (!stats) return <p>Loading...</p>;

    return (
        <div style={{ padding: "20px" }}>
            <h1>Admin Dashboard</h1>

            <ul>
                <li>Users: {stats.users}</li>
                <li>Quizzes: {stats.quizzes}</li>
                <li>Questions: {stats.questions}</li>
                <li>Submissions: {stats.submissions}</li>
            </ul>

            <button
                onClick={() => navigate("/admin/essay-corrections")}
                style={{
                    marginTop: "15px",
                    padding: "10px 20px",
                    fontSize: "16px",
                    cursor: "pointer"
                }}
            >
                ✍️ تصحيح الأسئلة المقالية
            </button>

            <button
                onClick={async () => {
                    if (window.confirm("هل تريد تصفير جميع النقاط؟")) {
                        await api.post("/leaderboard/reset-points");
                        alert("تم تصفير النقاط بنجاح");
                    }
                }}
                style={{
                    marginTop: "20px",
                    padding: "10px 15px",
                    background: "red",
                    color: "white",
                    border: "none",
                    borderRadius: "6px",
                    cursor: "pointer"
                }}
            >
                Reset Points
            </button>

            <button onClick={resetWeekly}>
                تصفير نقاط الأسبوع
            </button>

        </div>
    );
}