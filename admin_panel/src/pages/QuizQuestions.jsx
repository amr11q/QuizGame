import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../api/api";
import CreateQuestionForm from "../components/CreateQuestionForm";
import "./QuizQuestions.css";
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
        <div className="quiz-questions-page">

            <div className="quiz-header">

                <h1>Quiz Questions</h1>

                <button
                    className="add-btn"
                    onClick={() => setShowForm(true)}
                >
                    + Add Question
                </button>

            </div>

            {showForm && (
                <div className="modal-overlay">

                    <div className="modal-box">

                        <CreateQuestionForm
                            quizId={quizId}
                            onClose={() => setShowForm(false)}
                            onCreated={loadQuestions}
                        />

                    </div>

                </div>
            )}

            {loading ? (
                <p className="loading">Loading...</p>
            ) : questions.length === 0 ? (
                <p className="no-questions">No questions yet</p>
            ) : (
                <div className="questions-grid">

                            {questions.map((q, index) => (

                                <div className="question-card" key={q.id}>

                                    <h3>Question {index + 1}</h3>

                                    <p className="question-points">{q.points} pts</p>

                                    <div className="card-actions">
                                        <button className="edit-btn">Edit</button>
                                        <button
                                            className="delete-btn"
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