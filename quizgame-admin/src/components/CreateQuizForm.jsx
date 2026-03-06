import { useState } from "react";
import api from "../api/api";

export default function CreateQuizForm({ onClose, onCreated }) {
    const [title, setTitle] = useState("");
    const [quizDate, setQuizDate] = useState("");
    const [startAt, setStartAt] = useState("");
    const [durationMinutes, setDurationMinutes] = useState(30);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            // دمج التاريخ + الوقت
            const startDateTime = new Date(`${quizDate}T${startAt}`);

            await api.post("/quiz", {
                title,
                startAt: startDateTime.toISOString(),
                durationMinutes
            });

            onCreated();
            onClose();
        } catch (err) {
            console.error(err);
            setError("Failed to create quiz");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div style={{ border: "1px solid #444", padding: "15px", marginBottom: "15px", maxWidth: "500px" }}>
            <h3>Create Quiz</h3>

            {error && <p style={{ color: "red" }}>{error}</p>}

            <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    placeholder="Quiz title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    required
                />

                <input
                    type="date"
                    value={quizDate}
                    onChange={(e) => setQuizDate(e.target.value)}
                    required
                />

                <input
                    type="time"
                    value={startAt}
                    onChange={(e) => setStartAt(e.target.value)}
                    required
                />

                <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    min="1"
                />

                <br /><br />

                <button type="submit" disabled={loading}>
                    {loading ? "Saving..." : "Save"}
                </button>

                <button type="button" onClick={onClose} style={{ marginLeft: "10px" }}>
                    Cancel
                </button>
            </form>
        </div>
    );
}