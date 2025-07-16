import React from "react";
import getScoreColor from "./ScoreColor";
import { useGame } from "@/context/GameContext";

export default function GuessStream() {
  const {
    guesses: { data, isLoading, error },
  } = useGame();

  const wrapperClass =
    "m-auto bg-white rounded-xl shadow p-4 w-full max-w-xl max-h-full overflow-y-hidden";

  if (error) {
    console.error("Error loading guesses:", error);
    return (
      <div className={wrapperClass}>
        <h2>Error loading guesses</h2>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className={wrapperClass}>
        <h2>Loading...</h2>
      </div>
    );
  }

  return (
    <div className={wrapperClass}>
      <h2 className="text-xl font-semibold mb-2">Recent Guesses</h2>
      <ul className="space-y-1">
        {[...data.slice(-50)]
          .reverse()
          .map(({ id, user, guess, scorePercent }) => (
            <li key={id} className="text-sm flex justify-between">
              <span>
                <strong>{user}</strong>: {guess}
              </span>
              <span className={`font-semibold ${getScoreColor(scorePercent)}`}>
                {scorePercent.toFixed(2)}%
              </span>
            </li>
          ))}
      </ul>
    </div>
  );
}
