import { useEffect, useState } from "react";
import api from "../services/api";
import "./WeeklyTop3.css";

export default function WeeklyTop3() {

    const [players, setPlayers] = useState([]);

    useEffect(() => {

        const load = async () => {

            try {

                const res = await api.get("/leaderboard/weekly-top3");

                if (Array.isArray(res.data)) {
                    setPlayers(res.data);
                } else {
                    setPlayers([]);
                }

            } catch (err) {

                console.log(err);
                setPlayers([]);

            }

        };

        load();

    }, []);

    return (

        <div className="weekly-page">

            <h1 className="weekly-title">
                🏆 أفضل 3 لاعبين هذا الأسبوع
            </h1>

            <div className="podium">

                {players.map((p, i) => (

                    <div
                        key={i}
                        className={`podium-card rank-${i}`}
                    >

                        <div className="medal">
                            {i === 0 && "🥇"}
                            {i === 1 && "🥈"}
                            {i === 2 && "🥉"}
                        </div>

                        <h2 className="player-name">
                            {p.name}
                        </h2>

                        <p className="points">
                            ⭐ نقاط الأسبوع: {p.weeklyPoints}
                        </p>

                        <p className="total">
                            📊 إجمالي النقاط: {p.totalPoints}
                        </p>

                    </div>

                ))}

            </div>

        </div>

    );

}