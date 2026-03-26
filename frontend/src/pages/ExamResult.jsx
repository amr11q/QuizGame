import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import "./ExamResult.css";

export default function ExamResult() {

    const { quizId } = useParams();
    const navigate = useNavigate();

    const [result, setResult] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {

        const fetchResult = async () => {

            try {

                const res = await api.get(`/quiz/${quizId}/result`);
                setResult(res.data);

            } catch {

                alert("❌ فشل تحميل نتيجة الامتحان");
                navigate("/quizzes");

            } finally {

                setLoading(false);

            }

        };

        fetchResult();

    }, [quizId, navigate]);


    if (loading) {

        return <p className="result-loading">جاري تحميل النتيجة...</p>;

    }

    if (!result) {

        return <p className="result-loading">لا توجد نتيجة</p>;

    }


    return (

        <div className="result-page">

            <div className="result-card">

                <h2 className="result-title">
                    📊 نتيجة الامتحان
                </h2>

                <div className="result-row">
                    📌 عدد الأسئلة
                    <span>{result.totalQuestions}</span>
                </div>

                <div className="result-row">
                    ✍️ عدد الأسئلة المجاب عليها
                    <span>{result.answeredQuestions}</span>
                </div>

                <div className="result-row">
                    🏆 الدرجة النهائية
                    <span className="score">{result.totalScore}</span>
                </div>

                <div className="result-row">
                    الحالة
                    {result.isCompleted ? (
                        <span className="status-done">✔ مكتمل</span>
                    ) : (
                        <span className="status-wait">⏳ غير مكتمل</span>
                    )}
                </div>

                <button
                    className="back-btn"
                    onClick={() => navigate("/quizzes")}
                >
                    ⬅ الرجوع إلى الامتحانات
                </button>

            </div>

        </div>

    );

}