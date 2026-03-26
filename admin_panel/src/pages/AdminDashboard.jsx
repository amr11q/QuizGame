import { useEffect, useState } from "react";
import api from "../api/api";
import { useNavigate } from "react-router-dom";
import "./AdminDashboard.css";

export default function AdminDashboard() {

    const navigate = useNavigate();
    const [stats, setStats] = useState(null);

    useEffect(() => {
        api.get("/admin/stats")
            .then(res => setStats(res.data))
            .catch(() => alert("فشل تحميل الاحصائيات"));
    }, []);

    const resetWeekly = async () => {
        try {
            await api.post("/leaderboard/reset-weekly");
            alert("تم تصفير نقاط الأسبوع");
        } catch {
            alert("فشل تصفير النقاط");
        }
    };

    if (!stats) return <div className="loading">Loading...</div>;

    return (
        <div className="admin-container">

            <div className="dashboard-card">

                <h1>Admin Dashboard</h1>

                <div className="stats-grid">

                    <div className="stat-box">
                        Users: {stats.users}
                    </div>

                    <div className="stat-box">
                        Quizzes: {stats.quizzes}
                    </div>

                    <div className="stat-box">
                        Questions: {stats.questions}
                    </div>

                    <div className="stat-box">
                        Submissions: {stats.submissions}
                    </div>

                </div>


                <button
                    className="btn essay"
                    onClick={() => navigate("/admin/essay-corrections")}
                >
                    ✍️ تصحيح الأسئلة المقالية
                </button>

                <button
                    className="btn reset"
                    onClick={async () => {
                        if (window.confirm("هل تريد تصفير جميع النقاط؟")) {
                            await api.post("/leaderboard/reset-points");
                            alert("تم تصفير النقاط");
                        }
                    }}
                >
                    Reset Points
                </button>

                <button
                    className="btn weekly"
                    onClick={resetWeekly}
                >
                    تصفير نقاط الأسبوع
                </button>

            </div>

        </div>
    );
}