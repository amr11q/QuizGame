import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Quiz from "./pages/Quiz";
import RequireAuth from "./services/RequireAuth";
import AvailableQuizzes from "./pages/AvailableQuizzes";
import Exam from "./pages/Exam";
import ExamResult from "./pages/ExamResult";
import Leaderboard from "./pages/Leaderboard";
import WeeklyTop3 from "./pages/WeeklyTop3";
import Landing from "./pages/Landing";

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route path="/" element={<Landing />} />

                <Route path="/login" element={<Login />} />

                <Route path="/leaderboard" element={<Leaderboard />} />

                <Route path="/weekly-top3" element={<WeeklyTop3 />} />

                <Route
                    path="/quizzes"
                    element={
                        <RequireAuth>
                            <AvailableQuizzes />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/exam/:quizId"
                    element={
                        <RequireAuth>
                            <Exam />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/quiz"
                    element={
                        <RequireAuth>
                            <Quiz />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/exam-result/:quizId"
                    element={
                        <RequireAuth>
                            <ExamResult />
                        </RequireAuth>
                    }
                />

                <Route
                    path="/dashboard"
                    element={
                        <RequireAuth>
                            <Dashboard />
                        </RequireAuth>
                    }
                />

                {/* آخر Route */}
                <Route path="*" element={<Navigate to="/" />} />

                <Route path="/leaderboard" element={<Leaderboard />} />

                <Route path="/weekly-top3" element={<WeeklyTop3 />} />

            </Routes>
        </BrowserRouter>
    );
}

export default App;