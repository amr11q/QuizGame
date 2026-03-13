import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../services/api";
import { useLocation } from "react-router-dom";
import "./Exam.css";

export default function Exam() {

    const { quizId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const duration = location.state?.duration ?? 2;

    const [questions, setQuestions] = useState([]);
    const [answers, setAnswers] = useState({});
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);

    const [isCompleted, setIsCompleted] = useState(false);

    const [timeLeft, setTimeLeft] = useState(0);
    const [now, setNow] = useState(Date.now());

    const [essayAnswers, setEssayAnswers] = useState({});


    useEffect(() => {

        const userId = localStorage.getItem("userId");
        const durationSeconds = duration * 60;

        let examEnd = localStorage.getItem(`exam_end_${userId}_${quizId}`);

        if (!examEnd) {

            const endTime = Date.now() + durationSeconds * 1000;

            localStorage.setItem(`exam_end_${userId}_${quizId}`, endTime.toString());

            examEnd = endTime;

        }

        examEnd = Number(examEnd);

        const updateTimer = () => {

            const remaining = Math.floor((examEnd - Date.now()) / 1000);

            if (remaining <= 0) {

                setTimeLeft(0);
                handleSubmitExam();

            } else {

                setTimeLeft(remaining);

            }

        };

        updateTimer();

        const timer = setInterval(updateTimer, 1000);

        return () => clearInterval(timer);

    }, [quizId]);


    useEffect(() => {

        const timer = setInterval(() => {
            setNow(Date.now());
        }, 1000);

        return () => clearInterval(timer);

    }, []);


    useEffect(() => {

        if (timeLeft === 0 && questions.length > 0) {
            alert("⏱ انتهى الوقت، سيتم إرسال الامتحان");
            handleSubmitExam();
        }

    }, [timeLeft]);


    useEffect(() => {

        const checkCompleted = async () => {

            try {

                const res = await api.get(`/quiz/${quizId}/completed`);

                if (res.data?.completed === true) {

                    setIsCompleted(true);

                }

            } catch {

                console.error("Failed to check exam status");

            }

        };

        checkCompleted();

    }, [quizId]);


    useEffect(() => {

        const loadQuestions = async () => {

            try {

                const res = await api.get(`/questions/by-quiz/${quizId}`);
                setQuestions(res.data);

            } catch {

                alert("❌ فشل تحميل أسئلة الامتحان");

            } finally {

                setLoading(false);

            }

        };

        loadQuestions();

    }, [quizId]);


    const handleSubmitExam = async () => {

        try {

            const answersList = Object.keys(answers).map(qId => ({
                questionId: Number(qId),
                selectedOptionId:
                    typeof answers[qId] === "number" ? Number(answers[qId]) : null,
                essayAnswer:
                    typeof answers[qId] === "string" ? answers[qId] : null
            }));

            const payload = {
                quizId: Number(quizId),
                answers: answersList
            };

            const res = await api.post("/submissions/submit-exam", payload);
            alert("✅ تم إرسال الامتحان بنجاح");

            if (res.data.totalPoints)

                localStorage.setItem("points", res.data.totalPoints);

            localStorage.removeItem(`exam_start_${quizId}`);

            navigate("/dashboard");

        }

        catch (err) {
            console.log("FULL ERROR:", err);
            console.log("SERVER ERROR:", err?.response?.data);

            if (err?.response?.data) {
                alert(JSON.stringify(err.response.data, null, 2));
            } else {
                alert("حدث خطأ أثناء إرسال الامتحان");
            }
        }



        finally {

            setSubmitting(false);

        }

    };


    if (loading) {

        return <p className="exam-loading">جاري تحميل الامتحان...</p>;

    }


    const minutes = Math.floor(timeLeft / 60);
    const seconds = timeLeft % 60;


    return (

        <div className="exam-page">

            <h2 className="exam-title">📝 الامتحان</h2>


            <div className="exam-timer">

                ⏱ الوقت المتبقي: {minutes}:{seconds.toString().padStart(2, "0")}

            </div>


            {isCompleted && (

                <p className="exam-completed">

                    ✅ لقد قمت بحل هذا الامتحان مسبقًا ولا يمكنك إرساله مرة أخرى

                </p>

            )}


            {questions.length === 0 ? (

                <p>لا توجد أسئلة في هذا الامتحان</p>

            ) : (

                <>

                    {questions.map((q, index) => (

                        <div key={q.id} className="question-card">

                            <h4>

                                {index + 1}) {q.text}

                            </h4>


                            {q.imagePath && (

                                <img
                                    src={`https://localhost:7222${q.imagePath}`}
                                    alt="question"
                                    className="question-image"
                                />

                            )}


                            <p className="question-points">

                                الدرجة: {q.points}

                            </p>


                            {q.type === 2 && (

                                <div className="options">

                                    {q.options.map(opt => (

                                        <label key={opt.id} className="option">

                                            <input
                                                type="radio"
                                                name={`question_${q.id}`}
                                                value={opt.id}
                                                checked={answers[q.id] === opt.id}
                                                onChange={() =>
                                                    setAnswers(prev => ({
                                                        ...prev,
                                                        [q.id]: opt.id
                                                    }))
                                                }
                                            />

                                            {opt.text}

                                        </label>

                                    ))}

                                </div>

                            )}


                            {q.type === 1 && (

                                <div className="essay-box">

                                    <textarea
                                        className="essay-answer"
                                        placeholder="اكتب إجابتك هنا..."
                                        value={typeof answers[q.id] === "string" && !answers[q.id].startsWith("data:image")
                                            ? answers[q.id]
                                            : ""}
                                        onChange={(e) =>
                                            setAnswers(prev => ({
                                                ...prev,
                                                [q.id]: e.target.value
                                            }))
                                        }
                                    />

                                    <input
                                        type="file"
                                        accept="image/*"
                                        onChange={(e) => {

                                            const file = e.target.files[0];
                                            if (!file) return;

                                            const reader = new FileReader();

                                            reader.onload = () => {

                                                setAnswers(prev => ({
                                                    ...prev,
                                                    [q.id]: reader.result
                                                }));

                                            };

                                            reader.readAsDataURL(file);

                                        }}
                                    />

                                    {answers[q.id]?.startsWith("data:image") && (

                                        <img
                                            src={answers[q.id]}
                                            alt="preview"
                                            style={{ width: "200px", marginTop: "10px", borderRadius: "8px" }}
                                        />

                                    )}

                                </div>

                            )}

                        </div>

                    ))}


                    <button
                        onClick={handleSubmitExam}
                        disabled={submitting || isCompleted}
                        className="submit-btn"
                    >

                        {isCompleted
                            ? "تم حل الامتحان"
                            : submitting
                                ? "جارٍ الإرسال..."
                                : "إرسال الامتحان"}

                    </button>

                </>

            )}

        </div>

    );

}