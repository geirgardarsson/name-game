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

  // Helper to get place indicator JSX
  function getPlaceIndicator(idx: number) {
    if (idx === 0) {
      return (
        <span className="inline-block w-7 h-7 mr-3 rounded-full bg-gradient-to-tr from-yellow-300 via-yellow-200 to-lime-200 text-yellow-900 font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-yellow-400 animate-pulse">
          🥇
        </span>
      );
    }
    if (idx === 1) {
      return (
        <span className="inline-block w-7 h-7 mr-3 rounded-full bg-gradient-to-tr from-gray-700 to-gray-400 text-gray-900 font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-gray-400">
          🥈
        </span>
      );
    }
    if (idx === 2) {
      return (
        <span className="inline-block w-7 h-7 mr-3 rounded-full bg-gradient-to-tr from-amber-400 via-amber-200 to-pink-200 text-amber-900 font-extrabold text-lg flex items-center justify-center shadow-md border-2 border-amber-400">
          🥉
        </span>
      );
    }
    return null;
  }

  // Helper to get background class
  function getBgClass(idx: number) {
    if (idx === 0) return "bg-yellow-100/80 border-yellow-200";
    if (idx === 1) return "bg-gray-300 border-gray-300";
    if (idx === 2) return "bg-orange-100/80 border-orange-200";
    return "bg-blue-50/70 border-blue-100";
  }

  // Helper to get li style
  function getLiStyle(idx: number) {
    return idx < 3 ? { boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" } : {};
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-4 pb-2 w-full max-w-xl">
      <h2 className="text-xl font-semibold mb-2">Top Guesses</h2>
      <ul className="space-y-2">
        {data.topGuesses
          .slice(0, maxResults ?? data.topGuesses.length)
          .map(({ id, user, guess, scorePercent }, idx) => (
            <li
              key={id}
              className={`flex justify-between items-center border-b border-gray-100 pb-1 px-2 rounded-lg transition-all duration-200 ${getBgClass(
                idx
              )} ${
                idx < 3 ? "scale-105 shadow" : "hover:bg-blue-100/60"
              } animate-bounce-in`}
              style={getLiStyle(idx)}
            >
              <div className="flex items-center">
                {getPlaceIndicator(idx)}
                <span className="font-playful font-medium text-base md:text-lg">
                  {user}
                </span>
                <span className="mx-1 text-gray-400 font-light">:</span>
                <span className="font-playful text-base md:text-lg">
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
          ))}
      </ul>
    </div>
  );
}
