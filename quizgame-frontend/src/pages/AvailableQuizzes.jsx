import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLocation } from "react-router-dom";
import "./AvailableQuizzes.css";

export default function AvailableQuizzes() {

    const [quizzes, setQuizzes] = useState([]);
    const [loading, setLoading] = useState(true);

    const navigate = useNavigate();
    const location = useLocation();

    const duration = location.state?.duration ?? 2;

    useEffect(() => {

        const fetchQuizzes = async () => {

            try {

                const res = await api.get("/quiz/available");

                setQuizzes(res.data);

            } catch {

                alert("فشل تحميل الامتحانات");

            } finally {

                setLoading(false);

            }

        };

        fetchQuizzes();

    }, []);

    const handleEnterQuiz = (quiz) => {

        if (quiz.isSolved) {

            alert("⚠️ تم حل هذا الامتحان مسبقًا");

            return;

        }

        navigate(`/exam/${quiz.id}`, {

            state: { duration: quiz.durationMinutes }

        });

    };

    if (loading) {

        return <p className="loading">جاري تحميل الامتحانات...</p>;

    }

    return (

        <div className="quizzes-page">

            <h2 className="quizzes-title">📚 الامتحانات المتاحة</h2>

            {quizzes.length === 0 ? (

                <p className="no-quizzes">لا يوجد امتحانات متاحة حاليًا</p>

            ) : (

                quizzes.map((quiz) => (

                    <div key={quiz.id} className="quiz-card">

                        <h3>{quiz.title}</h3>

                        <p>⏱️ المدة: {quiz.durationMinutes} دقيقة</p>

                        <p>
                            الحالة:
                            {quiz.isSolved
                                ? <span className="status solved"> ✅ تم الحل</span>
                                : <span className="status open"> 🟢 لم يتم الحل</span>
                            }
                        </p>

                        {!quiz.isSolved ? (

                            <button
                                className="quiz-btn"
                                onClick={() => handleEnterQuiz(quiz)}
                            >
                                ابدأ الامتحان
                            </button>

                        ) : (

                            <div className="quiz-actions">

                                <button className="quiz-btn disabled" disabled>
                                    تم حل الامتحان
                                </button>

                                <button
                                    className="quiz-btn result"
                                    onClick={() =>
                                        navigate(`/exam-result/${quiz.id}`)
                                    }
                                >
                                    عرض النتيجة
                                </button>

                            </div>

                        )}

                    </div>

                ))

            )}

        </div>

    );

}