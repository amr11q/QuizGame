import { BrowserRouter, Routes, Route } from "react-router-dom";

import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import AdminLayout from "./layouts/AdminLayout";
import Quizzes from "./pages/Quizzes";
import QuizQuestions from "./pages/QuizQuestions";
import EssayCorrection from "./pages/EssayCorrection";
import AdminGuard from "./guards/AdminGuard";
export default function App() {
    return (
        <BrowserRouter basename="/admin">
            <Routes>
                <Route
                    path="/admin"
                    element={
                        <AdminGuard>
                            <AdminLayout />
                        </AdminGuard>
                    }
                >
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="essay-corrections" element={<EssayCorrection />} />
                </Route>

         

                <Route path="/admin/login" element={<AdminLogin />} />
                <Route
                    path="/admin/essay-corrections"
                    element={
                        <AdminGuard>
                            <AdminLayout>
                                <EssayCorrection />
                            </AdminLayout>
                        </AdminGuard>
                    }
                />

                <Route path="/admin" element={<AdminLayout />}>
                    <Route path="dashboard" element={<AdminDashboard />} />
                    <Route path="quizzes" element={<Quizzes />} />
                    <Route path="quizzes/:quizId/questions" element={<QuizQuestions />} />
                </Route>


            </Routes>
        </BrowserRouter>
    );
}