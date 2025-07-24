import React from "react";
import getScoreColor from "./ScoreColor";
import { getRandomColorPair } from "./ColorUtils";
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

  // Helper to get li style for top 3
  function getLiStyle(idx: number) {
    return idx < 3 ? { boxShadow: "0 2px 8px 0 rgba(0,0,0,0.08)" } : {};
  }

  return (
    <div className="bg-white rounded-xl shadow-lg px-4 py-2 w-full max-w-xl">
      <h2 className="text-xl font-bold mb-4 text-center text-gray-700">
        Topp Gisk
      </h2>
      <ul className="space-y-2">
        {data.topGuesses
          .slice(0, maxResults ?? data.topGuesses.length)
          .map(({ id, user, guess, scorePercent }, idx) => {
            // Use color pair based on id+user+guess for consistency
            const { pastel, strong } = getRandomColorPair(id + user + guess);
            return (
              <li
                key={id}
                className={`grid grid-cols-4 gap-2 items-center border-b border-gray-100 pb-1 px-2 rounded-lg transition-all duration-200 animate-bounce-in ${
                  idx < 3 ? "scale-105 shadow" : "hover:bg-blue-100/60"
                }`}
                style={{ background: pastel, ...getLiStyle(idx) }}
              >
                <div className="col-span-1 flex items-center min-w-0">
                  {getPlaceIndicator(idx)}
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
                  className={`col-span-1 flex justify-end font-extrabold text-lg md:text-xl drop-shadow-sm ${getScoreColor(
                    scorePercent
                  )}`}
                  style={{
                    textShadow:
                      idx === 0
                        ? "0 0 6px #ffe066, 0 1px 4px rgba(0,0,0,0.13), 0 0px 1px rgba(0,0,0,0.10)"
                        : "0 1px 4px rgba(0,0,0,0.13), 0 0px 1px rgba(0,0,0,0.10)",
                  }}
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
