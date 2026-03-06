import { useEffect, useState } from "react";
import api from "../api/api";

export default function EssayCorrection() {
    const [submissions, setSubmissions] = useState([]);
    const [loading, setLoading] = useState(true);
    const [scores, setScores] = useState({}); // { submissionId: score }
    const [saving, setSaving] = useState(false);
    const [filterQuizId, setFilterQuizId] = useState("");

    // =========================
    // فلترة حسب الامتحان
    // =========================
    const filteredSubmissions = filterQuizId
        ? submissions.filter(s => s.quizId == filterQuizId)
        : submissions;

    // =========================
    // تحميل الإجابات المقالية غير المصححة
    // =========================
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

    // =========================
    // تغيير الدرجة
    // =========================
    const handleScoreChange = (submissionId, value) => {
        setScores(prev => ({
            ...prev,
            [submissionId]: value
        }));
    };

    // =========================
    // حفظ التصحيح
    // =========================
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

            // إزالة الإجابة المصححة
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
        return <p style={{ padding: "20px" }}>جاري تحميل الإجابات...</p>;
    }

    return (
        <div style={{ padding: "20px" }}>
            <h2>📝 تصحيح الأسئلة المقالية</h2>

            {/* ===== فلتر الامتحانات ===== */}
            <select
                value={filterQuizId}
                onChange={(e) => setFilterQuizId(e.target.value)}
                style={{ padding: "6px", marginBottom: "15px" }}
            >
                <option value="">كل الامتحانات</option>
                {[...new Set(submissions.map(s => s.quizId))].map(id => (
                    <option key={id} value={id}>
                        Quiz #{id}
                    </option>
                ))}
            </select>

            {filteredSubmissions.length === 0 ? (
                <p>🎉 لا توجد إجابات تحتاج تصحيح</p>
            ) : (
                filteredSubmissions.map(sub => (
                    <div
                        key={sub.id}
                        style={{
                            border: "1px solid #444",
                            padding: "15px",
                            marginTop: "15px",
                            borderRadius: "6px"
                        }}
                    >
                        <p><strong>👤 الطالب:</strong> {sub.userName ?? sub.userId}</p>
                        <p>
                            <strong>📘 الامتحان:</strong>{" "}
                            {sub.quizTitle
                                ? sub.quizTitle
                                : sub.quizId
                                    ? `Quiz #${sub.quizId}`
                                    : "غير معروف"}
                        </p>

                        <hr />

                        <p><strong>✏️ إجابة الطالب:</strong></p>
                        <div
                            style={{
                                background: "#f5f5f5",
                                padding: "10px",
                                borderRadius: "4px",
                                whiteSpace: "pre-wrap"
                            }}
                        >
                            {sub.answerText || "—"}
                        </div>

                        {sub.imagePath && (
                            <>
                                <p style={{ marginTop: "10px" }}>
                                    <strong>🖼️ صورة مرفقة:</strong>
                                </p>
                                <img
                                    src={sub.imagePath}
                                    alt="answer"
                                    style={{ maxWidth: "100%", marginTop: "5px" }}
                                />
                            </>
                        )}

                        <div style={{ marginTop: "15px" }}>
                            <input
                                type="number"
                                placeholder="الدرجة"
                                value={scores[sub.id] ?? ""}
                                onChange={(e) =>
                                    handleScoreChange(sub.id, e.target.value)
                                }
                                style={{
                                    width: "100px",
                                    padding: "5px",
                                    marginRight: "10px"
                                }}
                            />

                            <button
                                onClick={() => handleCorrect(sub.id)}
                                disabled={saving}
                                style={{
                                    padding: "6px 12px",
                                    cursor: saving ? "not-allowed" : "pointer"
                                }}
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