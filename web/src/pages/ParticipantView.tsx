import React, { useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import useLocalStorage from "@/hooks/useLocalStorage";
import StandingsPanel from "@/components/StandingsPanel";
import GuessStream from "@/components/GuessStream";
import UsernameForm from "@/components/UsernameForm";
import GuessForm from "@/components/GuessForm";
import { GameProvider } from "@/context/GameContext";
import GameStatus from "@/components/GameStatus";

export default function ParticipantView() {
  const { gameId } = useParams<{ gameId: string }>();
  const [searchParams] = useSearchParams();
  const maxGuesses = Number(searchParams.get("maxGuesses")) || 5;

  if (!gameId) {
    throw new Error("Game ID is missing from the route.");
  }
  const [username, setUsername] = useLocalStorage("username", "");
  const [isEditing, setIsEditing] = useState(false);

  return (
    <GameProvider gameId={gameId}>
      <div className="flex flex-col items-center gap-2 p-2 min-h-screen bg-gradient-to-br from-green-100 to-blue-200 sm:p-6">
        <div className="w-full max-w-full sm:max-w-md space-y-2 px-0 sm:px-0">
          <GameStatus />
          {!username || isEditing ? (
            <UsernameForm
              onSubmit={(name) => {
                setUsername(name);
                setIsEditing(false);
              }}
              initialValue={username}
            />
          ) : (
            <div className="w-full space-y-2">
              <StandingsPanel maxResults={5} />
              <GuessStream maxGuesses={maxGuesses} />
              <GuessForm gameId={gameId} username={username} />
              <div className="flex items-center ml-2 text-lg font-bold">
                <div
                  className="ml-2 text-lg font-bold underline cursor-pointer inline-block hover:text-blue-700"
                  title="Click to edit your name"
                  onClick={() => setIsEditing(true)}
                >
                  {username}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </GameProvider>
  );
}
