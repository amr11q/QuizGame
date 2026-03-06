import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import CreateQuestionForm from "../components/CreateQuestionForm";

export default function QuizQuestions() {
    const { quizId } = useParams();

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState(null);

    // ✅ هنا بالظبط
    const loadQuestions = async () => {
        setLoading(true);
        try {
            const res = await api.get(`/questions/by-quiz/${quizId}`);
            setQuestions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };
    const handleDelete = async (id) => {
        const ok = window.confirm("Are you sure you want to delete this question?");
        if (!ok) return;

        try {
            await api.delete(`/questions/${id}`);
            setQuestions(prev => prev.filter(q => q.id !== id));
        } catch (err) {
            console.error(err);
            alert("Error deleting question");
        }
    };
    <CreateQuestionForm
        quizId={quizId}
        editingQuestion={editingQuestion}
        onClose={() => {
            setShowForm(false);
            setEditingQuestion(null);
        }}
        onSaved={loadQuestions}
    />


    // ✅ وهنا
    useEffect(() => {
        loadQuestions();
    }, [quizId]);

    return (
        <div>
            <h1>Quiz Questions</h1>

            <button onClick={() => setShowForm(true)}>
                + Add Question
            </button>

            {showForm && (
                <CreateQuestionForm
                    quizId={quizId}
                    onClose={() => setShowForm(false)}
                    onCreated={loadQuestions}
                />
            )}

            {loading ? (
                <p>Loading...</p>
            ) : questions.length === 0 ? (
                <p>No questions yet</p>
            ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                            {questions.map(q => (
                                <div
                                    key={q.id}
                                    style={{
                                        border: "1px solid #444",
                                        padding: "12px",
                                        borderRadius: "8px",
                                        background: "#1e1e1e"
                                    }}
                                >
                                    <h3 style={{ margin: 0 }}>{q.text}</h3>
                                    <p style={{ opacity: 0.8 }}>{q.points} pts</p>

                                    <div style={{ display: "flex", gap: "10px" }}>
                                        <button onClick={() => {
                                            setEditingQuestion(q);
                                            setShowForm(true);
                                        }}>
                                            Edit
                                        </button>
                                        <button
                                            style={{ color: "red" }}
                                            onClick={() => handleDelete(q.id)}
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
            )}
        </div>
    );
}