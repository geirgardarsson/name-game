import React from "react";
import getScoreColor from "./ScoreColor";
import { useGame } from "@/context/GameContext";

import { getRandomColorPair } from "./ColorUtils";

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
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
        Nýjustu gisk
      </h2>
      <ul className="space-y-1 overflow-x-hidden">
        {[...data.slice(0, maxGuesses)].map(
          ({ id, user, guess, scorePercent }) => {
            const { pastel, strong } = getRandomColorPair(id + user + guess);
            return (
              <li
                key={id}
                className="grid grid-cols-4 gap-2 items-center border-b border-gray-100 pb-1 px-2 rounded-lg transition-all duration-200 animate-bounce-in shadow"
                style={{ background: pastel }}
              >
                <div className="col-span-1 flex items-center min-w-0">
                  <span
                    className="font-playful font-semibold text-base md:text-lg"
                    style={{ color: strong }}
                  >
                    {user}
                  </span>
                </div>
                <div className="col-span-2 flex items-center min-w-0">
                  <span
                    className="m-auto font-playful text-base md:text-lg font-light"
                    style={{ color: strong }}
                  >
                    {guess}
                  </span>
                </div>
                <div
                  className={`col-span-1 flex justify-end font-semibold ${getScoreColor(
                    scorePercent
                  )}`}
                  style={{
                    textShadow:
                      "0 1px 4px rgba(0,0,0,0.13), 0 0px 1px rgba(0,0,0,0.10)",
                  }}
                >
                  {scorePercent.toFixed(2)}%
                </div>
              </li>
            );
          }
        )}
      </ul>
    </div>
  );
}
