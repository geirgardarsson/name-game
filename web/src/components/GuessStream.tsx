import React from "react";
import getScoreColor from "./ScoreColor";
import { useGame } from "@/context/GameContext";

interface GuessStreamProps {
  maxGuesses?: number;
}

export default function GuessStream({ maxGuesses = 50 }: GuessStreamProps) {
  const {
    guesses: { data, isLoading, error },
  } = useGame();

  const wrapperClass =
    "m-auto bg-white rounded-xl shadow p-2 w-full max-w-xl overflow-y-hidden h-full";

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
        {[...data.slice(0, maxGuesses)].map(
          ({ id, user, guess, scorePercent }) => (
            <li
              key={id}
              className="flex justify-between items-center border-b border-gray-100 pb-1 px-2 rounded-lg transition-all duration-200 bg-blue-50/70 hover:bg-blue-100/60 animate-bounce-in"
            >
              <div>
                <span className="font-playful font-semibold text-base md:text-lg">
                  {user}
                </span>
                <span className="mx-1 text-gray-400 font-medium">:</span>
                <span className="font-playful text-base md:text-lg font-light">
                  {guess}
                </span>
              </div>
              <div className={`font-semibold ${getScoreColor(scorePercent)}`}>
                {scorePercent.toFixed(2)}%
              </div>
            </li>
          )
        )}
      </ul>
    </div>
  );
}
