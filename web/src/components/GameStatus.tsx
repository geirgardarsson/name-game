import { useGame } from "@/context/GameContext";
import React from "react";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";
import { QRCode } from "./QRCode";

const statusLabels: Record<string, string> = {
  Setup: "Leikur ekki hafinn...",
  Active: "Leikur í gangi!",
  Finished: "Leik lokið!",
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
        <div className="whitespace-nowrap text-2xl sm:text-4xl font-extrabold text-green-600 drop-shadow mb-4">
          🎉 Sigurvegari: {data.winner.winner} 🎉
        </div>
        <div className="text-2xl font-bold text-green-600 mb-2">Nafnið er:</div>
        <div className="font-playful text-4xl my-8 font-semibold animate-bounce">
          💖 {data.winner.answer} 💖
        </div>
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
      "animate-pop text-3xl font-extrabold text-green-500 drop-shadow-lg flex flex-col items-center";
  } else {
    statusClass = "text-lg font-semibold flex flex-col items-center";
  }

  return (
    <div className={statusClass + " flex flex-col items-center"}>
      {text}
      {displayQR && gameId && (
        <div className="mt-16 mb-8 p-8 bg-white rounded-xl flex flex-col items-center">
          <QRCode
            value={`${window.location.origin}/play/${gameId}`}
            size={240}
          />
          <div className="mt-8 text-medium font-semibold text-gray-700">
            Kóði: {data.gameHandle.toUpperCase()}
          </div>
        </div>
      )}
    </div>
  );
}
