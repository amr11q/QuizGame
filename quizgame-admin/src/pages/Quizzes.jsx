import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/api";
import CreateQuizForm from "../components/CreateQuizForm";
import "./Quizzes.css";

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

        } catch {

            alert("❌ فشل حذف الكويز");

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

        <div className="quizzes-page">

            <div className="quizzes-container">

                {/* العنوان + الزر */}

                <div className="header-section">

                    <h1 className="page-title">Quizzes</h1>

                    <button
                        className="create-btn"
                        onClick={() => setShowForm(true)}
                    >
                        + Create Quiz
                    </button>

                </div>


                {showForm && (
                    <CreateQuizForm
                        onClose={() => setShowForm(false)}
                        onCreated={loadQuizzes}
                    />
                )}

                {quizzes.length === 0 ? (

                    <p className="empty-text">No quizzes yet</p>

                ) : (

                    <table className="quiz-table">

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

                                    <td>
                                        {q.isActive ? "Active" : "Inactive"}
                                    </td>

                                    <td>

                                        <button
                                            className="questions-btn"
                                            onClick={() =>
                                                navigate(`/admin/quizzes/${q.id}/questions`)
                                            }
                                        >
                                            Add Questions
                                        </button>

                                        <button
                                            className="delete-btn"
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

        </div>

    );
}