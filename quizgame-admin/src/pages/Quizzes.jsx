import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import CreateQuizForm from "../components/CreateQuizForm";

export default function Quizzes() {
    const [quizzes, setQuizzes] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const navigate = useNavigate();

    const handleDeleteQuiz = async (quizId) => {
        const confirmDelete = window.confirm(
            "⚠️ هل أنت متأكد من حذف هذا الكويز؟ سيتم حذف كل الأسئلة والإجابات."
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/quizzes/${quizId}`);
            alert("✅ تم حذف الكويز بنجاح");

            setQuizzes(prev => prev.filter(q => q.id !== quizId));
        } catch (err) {
            alert("❌ فشل حذف الكويز");
            console.error(err);
        }
    };


    const loadQuizzes = () => {
        api
            .get("/quiz")
            .then(res => setQuizzes(res.data))
            .catch(err => console.error(err));
    };

    useEffect(() => {
        loadQuizzes();
    }, []);

    return (
        <div>
            <h1>Quizzes</h1>

            {/* زر إنشاء مسابقة */}
            <button
                onClick={() => setShowForm(true)}
                style={{ marginBottom: "15px" }}
            >
                + Create Quiz
            </button>


           

            {/* فورم الإنشاء */}
            {showForm && (
                <CreateQuizForm
                    onClose={() => setShowForm(false)}
                    onCreated={loadQuizzes}
                />
            )}

            {quizzes.length === 0 ? (
                <p>No quizzes yet</p>
            ) : (
                <table>
                    <thead>
                        <tr>
                            <th>Title</th>
                            <th>Active</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {quizzes.map(q => (
                            <tr key={q.id}>
                                <td>{q.title}</td>
                                <td>{q.isActive ? "Active" : "Inactive"}</td>
                                <td>
                                    <button
                                        onClick={() => navigate(`/admin/quizzes/${q.id}/questions`)}
                                    >
                                        Questions
                                    </button>

                                    <button
                                        style={{
                                            marginLeft: "10px",
                                            padding: "6px 12px",
                                            background: "#dc3545",
                                            color: "#fff",
                                            border: "none",
                                            borderRadius: "4px",
                                            cursor: "pointer"
                                        }}
                                        onClick={() => handleDeleteQuiz(q.id)}
                                    >
                                        Delete
                                    </button>

                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}