import { useNavigate } from "react-router-dom";
import "./Landing.css";
export default function Landing() {

    const navigate = useNavigate();

    return (

        <div className="landing">

            {/* animated particles */}
            <div className="particles"></div>

            <div className="navbar">
                <div className="logo">🏆 BrainBattle</div>
            </div>


            <div className="hero">
                <h1>
                    اختبر معلوماتك
                    <br />
                    وكن الأول في الترتيب
                </h1>

                <p>
                    مسابقة يومية + ترتيب أسبوعي + منافسة حقيقية بين اللاعبين
                </p>

                <div className="hero-buttons">

                    <button
                        className="start-btn"
                        onClick={() => navigate("/login")}
                    >
                        Start Quiz
                    </button>

                    <button
                        className="leader-btn"
                        onClick={() => navigate("/leaderboard")}
                    >
                        Leaderboard
                    </button>

                </div>

            </div>


            <div className="features">

                <div className="feature-card">

                    <div className="icon">⚡</div>

                    <h3>مسابقة يومية</h3>

                    <p>سؤال جديد كل يوم لاختبار معلوماتك</p>

                </div>


                <div className="feature-card">

                    <div className="icon">🏆</div>

                    <h3>Leaderboard</h3>

                    <p>أفضل 10 لاعبين في المنصة</p>

                </div>


                <div className="feature-card">

                    <div className="icon">🥇</div>

                    <h3>فائز أسبوعي</h3>

                    <p>أفضل لاعب كل أسبوع يحصل على المركز الأول</p>

                </div>

            </div>

        </div>

    );
}