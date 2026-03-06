import { useState } from "react";
import api from "../api/api";

export default function CreateQuestionForm({
    quizId,
    onClose,
    onSaved,
    editingQuestion,
    onCreated
}) {

    const [questionType, setQuestionType] = useState("mcq"); // mcq | essay
    const [contentType, setContentType] = useState("text"); // text | image

    const [text, setText] = useState("");
    const [image, setImage] = useState(null);

    const [points, setPoints] = useState(1);
    const [options, setOptions] = useState(["", "", "", ""]);
    const [correctIndex, setCorrectIndex] = useState(0);
    const [error, setError] = useState("");

    const handleOptionChange = (index, value) => {
        const updated = [...options];
        updated[index] = value;
        setOptions(updated);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            setError("");

            const backendType = questionType === "mcq" ? 2 : 1;

            const formData = new FormData();

            formData.append("quizId", quizId);
            formData.append("points", Number(points));
            formData.append("type", backendType);
            formData.append("contentType", contentType);

            if (contentType === "text") {
                formData.append("text", text);
            }

            if (contentType === "image" && image) {
                formData.append("image", image);
            }

            if (questionType === "mcq") {
                options.forEach((o, i) => {
                    formData.append(`Options[${i}].Text`, o);
                    formData.append(`Options[${i}].IsCorrect`, i === correctIndex);
                });
            }

            await api.post("/questions/add-question", formData);

            if (onSaved) onSaved();
            if (onCreated) onCreated();

            onClose();

        } catch (err) {
            console.error(err);
            setError("Error saving question");
        }
    };

    return (
        <div style={{ border: "1px solid #444", padding: "15px", marginTop: "15px" }}>
            <h3>{editingQuestion ? "Edit Question" : "Add Question"}</h3>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>

                {/* نوع السؤال */}
                <label>Question Type</label>
                <select
                    value={questionType}
                    onChange={(e) => setQuestionType(e.target.value)}
                >
                    <option value="mcq">اختياري</option>
                    <option value="essay">مقالي</option>
                </select>

                <br /><br />

                {/* شكل السؤال */}
                <label>Content Type</label>
                <select
                    value={contentType}
                    onChange={(e) => setContentType(e.target.value)}
                >
                    <option value="text">نص</option>
                    <option value="image">صورة</option>
                </select>

                <br /><br />

                {/* لو نص */}
                {contentType === "text" && (
                    <>
                        <input
                            placeholder="Question text"
                            value={text}
                            onChange={(e) => setText(e.target.value)}
                            required
                        />
                        <br /><br />
                    </>
                )}

                {/* لو صورة */}
                {contentType === "image" && (
                    <>
                        <input
                            type="file"
                            onChange={(e) => setImage(e.target.files[0])}
                            required
                        />
                        <br /><br />
                    </>
                )}

                <label>Points</label>
                <input
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(+e.target.value)}
                />

                <br /><br />

                {/* الاختيارات تظهر فقط لو MCQ */}
                {questionType === "mcq" && (
                    <>
                        {options.map((opt, i) => (
                            <div key={i}>
                                <input
                                    placeholder={`Option ${i + 1}`}
                                    value={opt}
                                    onChange={(e) => handleOptionChange(i, e.target.value)}
                                    required
                                />
                                <input
                                    type="radio"
                                    name="correct"
                                    checked={correctIndex === i}
                                    onChange={() => setCorrectIndex(i)}
                                />
                                Correct
                            </div>
                        ))}
                        <br />
                    </>
                )}

                <button type="submit">Save</button>
                <button type="button" onClick={onClose}>Cancel</button>

            </form>
        </div>
    );
}