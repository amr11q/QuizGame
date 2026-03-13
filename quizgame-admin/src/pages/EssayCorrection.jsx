import { useEffect, useState } from "react";
import api from "../api/api";
import "./EssayCorrection.css";

export default function EssayCorrection() {

    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({});
    const [saving, setSaving] = useState(false);
    const [filterQuizId, setFilterQuizId] = useState("");

    const filteredSubmissions = filterQuizId
        ? submissions.filter(s => s.quizId == filterQuizId)
        : submissions;

    useEffect(() => {

        const fetchSubmissions = async () => {

            try {

                const res = await api.get("/submissions/pending");

                setSubmissions(res.data);

            } catch {

                alert("❌ فشل تحميل الإجابات المقالية");

            } finally {

                setLoading(false);

            }

        };

        fetchSubmissions();

    }, []);


    const handleScoreChange = (submissionId, value) => {

        setScores(prev => ({
            ...prev,
            [submissionId]: value
        }));

    };


    const handleCorrect = async (submissionId) => {

        const score = scores[submissionId];

        if (score === undefined || score === "") {

            alert("⚠️ من فضلك أدخل الدرجة");

            return;

        }

        try {

            setSaving(true);

            await api.post(`/submissions/correct/${submissionId}/${Number(score)}`);

            alert("✅ تم حفظ التصحيح");

            setSubmissions(prev =>
                prev.filter(s => s.id !== submissionId)
            );

        } catch {

            alert("❌ حدث خطأ أثناء حفظ التصحيح");

        } finally {

            setSaving(false);

        }

    };


    if (loading) {

        return <p className="essay-loading">جاري تحميل الإجابات...</p>;

    }

    return (

        <div className="essay-page">

            <h2 className="essay-title">

                📝 تصحيح الأسئلة المقالية

            </h2>

            {/* فلتر الامتحانات */}

            <select
                className="essay-filter"
                value={filterQuizId}
                onChange={(e) => setFilterQuizId(e.target.value)}
            >

                <option value="">كل الامتحانات</option>

                {[...new Set(submissions.map(s => s.quizId))].map(id => (

                    <option key={id} value={id}>

                        Quiz #{id}

                    </option>

                ))}

            </select>


            {filteredSubmissions.length === 0 ? (

                <p className="essay-empty">

                    🎉 لا توجد إجابات تحتاج تصحيح

                </p>

            ) : (

                filteredSubmissions.map(sub => (

                    <div key={sub.id} className="essay-card">

                        <p>

                            <strong>👤 الطالب:</strong>

                            {sub.userName ?? sub.userId}

                        </p>


                        <p>

                            <strong>📘 الامتحان:</strong>

                            {sub.quizTitle
                                ? sub.quizTitle
                                : sub.quizId
                                    ? `Quiz #${sub.quizId}`
                                    : "غير معروف"}

                        </p>


                        <hr />


                        <p>

                            <strong>✏️ إجابة الطالب:</strong>

                        </p>


                        <div className="essay-answer">

                            {sub.answerText?.startsWith("data:image") ? (

                                <img
                                    src={sub.answerText}
                                    alt="answer"
                                    className="essay-image"
                                />

                            ) : (

                                sub.answerText || "--"

                            )}

                        </div>


                        {sub.imagePath && (

                            <img
                                src={sub.imagePath}
                                alt="answer"
                                className="essay-image"
                            />

                        )}


                        <div className="essay-actions">

                            <input
                                type="number"
                                placeholder="الدرجة"
                                value={scores[sub.id] ?? ""}
                                onChange={(e) =>
                                    handleScoreChange(sub.id, e.target.value)
                                }
                                className="essay-score"
                            />


                            <button
                                onClick={() => handleCorrect(sub.id)}
                                disabled={saving}
                                className="essay-save"
                            >

                                حفظ الدرجة

                            </button>

                        </div>

                    </div>

                ))

            )}

        </div>

    );

}