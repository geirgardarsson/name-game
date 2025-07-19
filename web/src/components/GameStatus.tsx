import { useGame } from "@/context/GameContext";
import React from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { QRCode } from "./QRCode";

const statusLabels: Record<string, string> = {
  Setup: "Waiting for game to start...",
  Active: "Game in progress!",
  Finished: "Game finished!",
};

interface GameStatusProps {
  displayQR?: boolean;
}

export default function GameStatus({ displayQR = false }: GameStatusProps) {
  const { status, gameId } = useGame();
  const { data, isLoading, error } = status;

  if (isLoading) return <div className="text-gray-500">Loading status...</div>;
  if (error) return <div className="text-red-500">Error loading status</div>;
  if (!status) return <div className="text-gray-500">No status available</div>;

  const { width, height } = useWindowSize();

  // Handle Finished state with winner and answer
  if (data.status === "Finished" && data.winner) {
    return (
      <div className="relative flex flex-col items-center justify-center py-12">
        <Confetti
          numberOfPieces={400}
          recycle={true}
          width={width}
          height={height}
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            pointerEvents: "none",
            zIndex: 50,
          }}
        />
        <div className="whitespace-nowrap text-3xl sm:text-4xl font-extrabold text-green-600 drop-shadow mb-4 animate-bounce">
          🎉 Winner: {data.winner.winner} 🎉
        </div>
        <div className="text-3xl font-bold text-blue-500 mb-2 animate-pulse">
          Correct Answer:{" "}
          <span className="underline">{data.winner.answer}</span>
        </div>
        <div className="text-xl text-gray-700 mt-4">Game finished!</div>
        {displayQR && gameId && (
          <div className="mt-6 flex flex-col items-center">
            <div className="mb-2 text-lg font-medium">Join this game:</div>
            <QRCode
              value={`${window.location.origin}/play/${gameId}`}
              size={160}
            />
          </div>
        )}
      </div>
    );
  }

  // Animations for Setup and Active states
  let statusClass = "";
  const text = statusLabels[data.status] || `Status: ${data.status}`;
  if (data.status === "Setup") {
    statusClass =
      "animate-pulse text-xl font-bold text-blue-500 drop-shadow flex flex-col items-center text-center";
  } else if (data.status === "Active") {
    statusClass =
      "animate-pop text-2xl font-extrabold text-green-500 drop-shadow-lg flex flex-col items-center";
  } else {
    statusClass = "text-lg font-semibold flex flex-col items-center";
  }

  return (
    <div className={statusClass + " flex flex-col items-center"}>
      {text}
      {displayQR && gameId && (
        <div className="mt-4 flex flex-col items-center">
          <div className="mb-2 text-base font-medium">
            Game Code: {data.gameHandle}
          </div>
          <QRCode
            value={`${window.location.origin}/play/${gameId}`}
            size={120}
          />
        </div>
      )}
    </div>
  );
}

// Add custom pop animation for Active state
// Add this to your global CSS (e.g., index.css or tailwind.config if using Tailwind)
// @layer utilities {
//   .animate-pop {
//     animation: pop 1s cubic-bezier(0.23, 1, 0.32, 1) infinite alternate;
//   }
//   @keyframes pop {
//     0% { transform: scale(1); }
//     50% { transform: scale(1.12) rotate(-2deg); }
//     100% { transform: scale(1.05) rotate(2deg); }
//   }
// }
