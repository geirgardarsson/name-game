import React from "react";
import getScoreColor from "./ScoreColor";
import { useGame } from "@/context/GameContext";

interface StandingsPanelProps {
  maxResults?: number;
}

export default function StandingsPanel({ maxResults }: StandingsPanelProps) {
  const {
    standings: { data, isLoading, error },
  } = useGame();

  const wrapperClass = "bg-white rounded-xl shadow-lg p-4 w-full max-w-xl";

  if (error) {
    console.error("Error loading standings:", error);
    return (
      <div className={wrapperClass}>
        <h2>Error loading standings</h2>
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
    <div className="bg-white rounded-xl shadow-lg p-4 pb-2 w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Top Guesses</h2>
      <ul className="space-y-2">
        {data.topGuesses
          .slice(0, maxResults ?? data.topGuesses.length)
          .map(({ id, user, guess, scorePercent }, idx) => {
            // Fancy number indicators for 1st, 2nd, 3rd
            let placeIndicator = null;
            let placeBg = "";
            let placeText = "";
            if (idx === 0) {
              placeIndicator = (
                <span className="inline-block w-7 h-7 mr-3 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-200 to-lime-200 text-yellow-900 font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-yellow-400 animate-pulse">
                  🥇
                </span>
              );
              placeBg =
                "bg-[radial-gradient(circle,rgba(255,255,120,0.7)_0%,rgba(255,255,0,0.2)_100%)] border-yellow-300";
              placeText = "text-yellow-700";
            } else if (idx === 1) {
              placeIndicator = (
                <span className="inline-block w-7 h-7 mr-3 rounded-full bg-gradient-to-tr from-gray-700 to-gray-400 text-gray-900 font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-gray-400">
                  🥈
                </span>
              );
              placeBg = "bg-gray-50 border-gray-300";
              placeText = "text-gray-700";
            } else if (idx === 2) {
              placeIndicator = (
                <span className="inline-block w-7 h-7 mr-3 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-pink-200 text-amber-900 font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-amber-400">
                  🥉
                </span>
              );
              placeBg =
                "bg-[radial-gradient(circle,rgba(255,180,80,0.7)_0%,rgba(255,120,0,0.15)_100%)] border-amber-300";
              placeText = "text-amber-700";
            }
            return (
              <li
                key={id}
                className={`flex justify-between items-center border-b border-gray-100 pb-1 px-2 rounded-lg transition-all duration-200 ${
                  idx < 3
                    ? `${placeBg} ${placeText} font-bold scale-105 shadow`
                    : "hover:bg-gray-50"
                }`}
                style={
                  idx < 3 ? { boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" } : {}
                }
              >
                <div className="flex items-center">
                  {placeIndicator}
                  <span className="font-medium text-base md:text-lg">
                    {user}
                  </span>
                  <span className="mx-1 text-gray-400 font-light">:</span>
                  <span className="text-base md:text-lg font-semibold">
                    {guess}
                  </span>
                </div>
                <div
                  className={`font-extrabold text-lg md:text-xl drop-shadow-sm ${getScoreColor(
                    scorePercent
                  )}`}
                  style={idx === 0 ? { textShadow: "0 0 6px #ffe066" } : {}}
                >
                  {scorePercent.toFixed(2)}%
                </div>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
