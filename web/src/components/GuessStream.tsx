import React from "react";
import getScoreColor from "./ScoreColor";
import { useGame } from "@/context/GameContext";

export default function GuessStream() {
  const {
    guesses: { data, isLoading, error },
  } = useGame();

  const wrapperClass =
    "m-auto bg-white rounded-xl shadow p-4 w-full max-w-xl overflow-y-hidden max-h-screen";

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
          // .reverse()
          .map(({ id, user, guess, scorePercent }) => (
            <li
              key={id}
              className="flex justify-between items-center border-b border-gray-100 pb-1 px-2 rounded-lg transition-all duration-200 hover:bg-gray-50"
            >
              <div>
                <strong>{user}</strong>: {guess}
              </div>
              <div className={`font-semibold ${getScoreColor(scorePercent)}`}>
                {scorePercent.toFixed(2)}%
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}
