import { useNavigate } from "react-router-dom";
import api from "../services/api";
import React from "react";
import "./Dashboard.css";
import { useState, useEffect } from "react";

const azkarList = [
    "سبحان الله وبحمده، سبحان الله العظيم",
    "اللهم صلِّ وسلم على سيدنا محمد ﷺ",
    "أستغفر الله العظيم وأتوب إليه",
    "لا إله إلا أنت سبحانك إني كنت من الظالمين",
    "حسبنا الله ونعم الوكيل",
    "لا حول ولا قوة إلا بالله",
    "الله أكبر كبيرًا، والحمد لله كثيرًا",
    "سبحان الله، والحمد لله، ولا إله إلا الله، والله أكبر",
    "اللهم إنك عفو تحب العفو فاعفُ عني",
    "رب اغفر لي ولوالدي وللمؤمنين يوم يقوم الحساب",
    "اللهم اهدنا واهدِ بنا واجعلنا سببًا لمن اهتدى",
    "اللهم ارزقنا الإخلاص في القول والعمل",
    "اللهم افتح لنا أبواب رحمتك",
    "اللهم لا سهل إلا ما جعلته سهلًا",
    "ربنا لا تزغ قلوبنا بعد إذ هديتنا",
    "اللهم اجعل القرآن ربيع قلوبنا",
    "يا حي يا قيوم برحمتك أستغيث",
    "اللهم ثبتنا عند السؤال",
    "اللهم أحسن خاتمتنا",
    "رب زدني علمًا",
    "اللهم بارك لنا في أوقاتنا",
    "اللهم قنا عذاب النار",
    "اللهم اغفر للمسلمين والمسلمات",
    "ربنا آتنا في الدنيا حسنة وفي الآخرة حسنة",
    "اللهم اشف مرضانا ومرضى المسلمين",
    "اللهم ارحم موتانا وموتى المسلمين",
    "اللهم ارزقنا حسن الظن بك",
    "اللهم اجعلنا من الذاكرين الله كثيرًا",
    "اللهم تقبل منا صالح الأعمال",
    "اللهم أعنا على ذكرك وشكرك وحسن عبادتك"
];

export default function Dashboard() {



    const navigate = useNavigate();

    const getRandomAzkar = () => {
        const shuffled = [...azkarList].sort(() => 0.5 - Math.random());
        return shuffled.slice(0, 3); // 3 أذكار
    };
    const [stats, setStats] = useState({
        attempts: 0,
        bestRank: "-"
    });
    const [azkarGroup, setAzkarGroup] = useState([]);
    useEffect(() => {
        setAzkarGroup(getRandomAzkar());

        const interval = setInterval(() => {
            setAzkarGroup(getRandomAzkar());
        }, 30000); // كل 30 ثانية

        return () => clearInterval(interval);



    }, []);
    useEffect(() => {

        const loadStats = async () => {

            try {

                const res = await api.get("/leaderboard/my-stats");

                setStats({
                    attempts: res.data.attempts,
                    bestRank: res.data.bestRank
                });

            } catch {

                console.log("فشل تحميل الإحصائيات");

            }

        };

        loadStats();

    }, []);

    return (
        <div className="dashboard">

            {/* Header */}
            <div className="dashboard-header">
                <h1>BrainBattle</h1>
                <p>مسابقة يومية – اختبر معلوماتك ونافس غيرك</p>
            </div>

            {/* Grid */}
            <div className="dashboard-grid">

                {/* Card 1 */}
                <div className="card card-active">
                    <h3>🟢 الإمتحان متاح الآن</h3>
                    <p>يمكنك البدء في حل الإمتحان الآن</p>
                 

                    <button
                        className="exams-btn"
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate("/quizzes"); // قائمة الامتحانات
                        }}
                    >
                        📚 الامتحانات
                    </button>
                </div>

                {/* Card 2 */}
                <div className="card">
                    <h3>🏆 الترتيب</h3>

                    <p>شاهد أفضل اللاعبين والفائز الأسبوعي</p>

                    <button
                        onClick={() => navigate("/leaderboard")}
                        style={{
                            marginTop: "10px",
                            padding: "10px 15px",
                            background: "#2c7be5",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            width: "100%"
                        }}
                    >
                        🏆 Top 10
                    </button>

                    <button
                        onClick={() => navigate("/weekly-top3")}
                        style={{
                            marginTop: "10px",
                            padding: "10px 15px",
                            background: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            cursor: "pointer",
                            width: "100%"
                        }}
                    >
                        🥇 الفائز الأسبوعي
                    </button>
                </div>

                {/* Card 3 */}
                <div className="card">
                    <h3 class="card-title">تعليمات</h3>
                    <p class="card-text">  <ul>
                        <li>⏱️ الالتزام بالوقت شرط أساسي لقبول المشاركة.</li>
                        <li>🔁 لا يمكن تعديل الإجابة بعد الإرسال.</li>
                        <li>❌ أي محاولة غش تؤدي إلى استبعاد المشاركة.</li>
                        <li>الترتيب يعتمد على دقة الحل وليس السرعة فقط.</li>
                        <li>القرار النهائي للتقييم يرجع لإدارة المسابقة.</li>

                    </ul></p>

                  
                </div>

                {/* Card 4 */}
                <div className="card">
                    <h3>🔥 نصيحة للمنافسة</h3>
                    <ul>
                        <li> اقرأ السؤال جيدًا قبل الإجابة، فقد تخدعك التفاصيل الصغيرة. </li>
                        <li> كل إجابة صحيحة تقربك خطوة من الصدارة… فكر جيدًا قبل أن تختار. </li>
                        <li> لا تتسرع في الإجابة، دقيقة تفكير إضافية قد تقودك إلى القمة. </li>
                        <li> الاستمرارية اليومية ترفع ترتيبك . </li>
                    </ul>
                  
                </div>

                {/* Card 5 */}
                <div class="card stats-card">
                    <h3>📊 إحصائياتك</h3>
                    <div>
                        <ul><li> عدد المشاركات :{stats.attempts} </li></ul> 
                    </div>
                    <div>
                        <ul><li> أفضل ترتيب:{stats.bestRank ? " " + stats.bestRank : "-"}</li></ul>   
                    </div>
                   
                </div>

                {/* Card 6 */}
                <div className="card">
                    <h3>📿 ذكر اليوم</h3>

                    <ul className="azkar-list">
                        {azkarGroup.map((zekr, index) => (
                            <li key={index}>{zekr}</li>
                        ))}
                    </ul>
                </div>

            </div>
        </div>
    );
}