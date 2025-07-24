import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { API_URL } from "@/config";
import { GameCodeInput } from "@/components/ui/GameCodeInput";
import { Button } from "@/components/ui/Button";

export default function PrepareGameDisplay() {
  const [gameCode, setGameCode] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!gameCode.trim()) {
      return;
    }

    try {
      const response = await fetch(`${API_URL}/game/join/${gameCode}`, {
        method: "GET",
      });

      if (!response.ok) {
        console.error(response);
        throw new Error("Failed to join game");
      }

      const data = await response.json();
      const gameId = data.id;

      navigate(`/display/${gameId}`);
    } catch (error) {
      console.error("Error joining game:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-yellow-100 to-pink-200">
      <h1 className="text-3xl font-bold mb-4">Sláðu inn kóða</h1>
      <div className="flex gap-2">
        <GameCodeInput value={gameCode} onChange={setGameCode} />
        <Button onClick={() => handleSubmit()}>Áfram</Button>
      </div>
    </div>
  );
}
