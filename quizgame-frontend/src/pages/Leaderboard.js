import { useEffect, useState } from "react";
import api from "../services/api";
import "./Leaderboard.css";

export default function Leaderboard() {

    const [leaders, setLeaders] = useState([]);

    useEffect(() => {

        const load = async () => {

            try {

                const res = await api.get("/leaderboard/top10");

                if (Array.isArray(res.data)) {

                    // ترتيب اللاعبين حسب النقاط
                    const sorted = [...res.data].sort((a, b) => b.points - a.points);

                    setLeaders(sorted);

                } else {

                    setLeaders([]);

                }

            } catch {

                alert("فشل تحميل الترتيب");

            }

        };

        load();

    }, []);

    const medal = (index) => {

        if (index === 0) return "🥇";
        if (index === 1) return "🥈";
        if (index === 2) return "🥉";

        return `#${index + 1}`;

    };

    return (

        <div className="leaderboard">

            <h1 className="leader-title">🏆 Top 10 Players</h1>

            <div className="leader-list">

                {leaders.map((user, index) => (

                    <div
                        key={user.id}
                        className={`leader-card rank-${index}`}
                    >

                        <div className="rank">
                            {medal(index)}
                        </div>

                        <div className="avatar">
                            {user.name?.charAt(0).toUpperCase() || "P"}
                        </div>

                        <div className="player">
                            {user.name || "Player"}
                        </div>

                        <div className="score">
                            {user.points} pts
                        </div>

                    </div>

                ))}

            </div>

        </div>

    );

}