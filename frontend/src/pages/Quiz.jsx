import { useEffect, useState } from "react";
import api from "../services/api";
import "./Quiz.css";

// ⏱️ ثوابت
const QUIZ_DURATION = 15 * 60; // 15 دقيقة
const STORAGE_KEY = "quiz_start_time";

export default function Quiz() {
    const [timeLeft, setTimeLeft] = useState(QUIZ_DURATION);
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);
    const [submitted, setSubmitted] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);
    const [loading, setLoading] = useState(false);

    // 🧠 سؤال اليوم
    const [question, setQuestion] = useState(null);
    const [questionLoading, setQuestionLoading] = useState(true);

    // ⏱️ Timer ثابت
    useEffect(() => {
        let startTime = localStorage.getItem(STORAGE_KEY);

        if (!startTime) {
            startTime = Date.now();
            localStorage.setItem(STORAGE_KEY, startTime);
        }

        const start = parseInt(startTime, 10);

        const interval = setInterval(() => {
            const now = Date.now();
            const elapsed = Math.floor((now - start) / 1000);
            const remaining = QUIZ_DURATION - elapsed;

            if (remaining <= 0) {
                setTimeLeft(0);
                clearInterval(interval);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    // 📥 جلب سؤال اليوم
    useEffect(() => {
        const fetchQuestion = async () => {
            try {
                const res = await api.get("/quizzes/active/questions");
                if (res.data && res.data.length > 0) {
                    setQuestion(res.data[0]);
                }
            } catch {
                alert("فشل تحميل سؤال اليوم");
            } finally {
                setQuestionLoading(false);
            }
        };

        fetchQuestion();
    }, []);

    // ✅ هل المستخدم حل السؤال قبل كده؟
    useEffect(() => {
        if (!question) return;

        const checkSubmitted = async () => {
            try {
                const res = await api.get(
                    `/submissions/has-submitted/${question.id}`
                );
                setAlreadySubmitted(res.data === true);
            } catch (err) {
                console.error(err);
            }
        };

        checkSubmitted();
    }, [question]);

    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;

    // 📷 اختيار الصورة
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImage(file);
        setPreview(URL.createObjectURL(file));
    };

    // 🚀 إرسال الحل
    const handleSubmit = async () => {
        if (alreadySubmitted) {
            alert("✅ لقد قمت بإرسال إجابتك بالفعل");
            return;
        }

        if (!image) {
            alert("من فضلك ارفع صورة الحل");
            return;
        }

        if (!question) {
            alert("لا يوجد سؤال متاح");
            return;
        }

        try {
            setLoading(true);

            const formData = new FormData();
            formData.append("questionId", question.id);
            formData.append("answerImage", image);

            await api.post("/submissions/submit", formData);

            setSubmitted(true);
            setAlreadySubmitted(true);
            localStorage.removeItem(STORAGE_KEY);

            alert("تم إرسال الحل بنجاح ✅");
        } catch {
            alert("حدث خطأ أثناء الإرسال ❌");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="quiz-page">
            {/* Header */}
            <div className="quiz-header">
                <h1>كويز اليوم</h1>
                <div className="timer">
                    ⏱️ {minutes}:{seconds.toString().padStart(2, "0")}
                </div>
            </div>

            {/* Question */}
            <div className="quiz-card">
                <h3>✍️ السؤال</h3>

                {questionLoading ? (
                    <p>جاري تحميل السؤال...</p>
                ) : question ? (
                    <p>{question.text}</p>
                ) : (
                    <p>لا يوجد سؤال متاح حاليًا</p>
                )}
            </div>

            {/* 🚫 رسالة في حالة الحل المسبق */}
            {alreadySubmitted && (
                <div
                    style={{
                        background: "#ffecec",
                        color: "#c0392b",
                        padding: "10px",
                        borderRadius: "6px",
                        marginBottom: "10px",
                    }}
                >
                    ⚠️ لقد قمت بحل هذا الامتحان مسبقًا ولا يمكنك الإرسال مرة أخرى
                </div>
            )}

            {/* Upload */}
            <div className="quiz-card">
                <h3>📷 ارفع صورة الحل</h3>
                <input
                    type="file"
                    accept="image/*"
                    disabled={alreadySubmitted || submitted || timeLeft === 0}
                    onChange={handleImageChange}
                />

                {preview && (
                    <img src={preview} alt="preview" className="preview" />
                )}
            </div>

            {/* Submit */}
            <button
                className="submit-btn"
                disabled={
                    loading ||
                    timeLeft === 0 ||
                    alreadySubmitted ||
                    submitted
                }
                onClick={handleSubmit}
            >
                {alreadySubmitted
                    ? "تم إرسال الإجابة"
                    : loading
                        ? "جارٍ الإرسال..."
                        : submitted
                            ? "تم الإرسال"
                            : timeLeft === 0
                                ? "انتهى الوقت"
                                : "إرسال الحل"}
            </button>
        </div>
    );
}