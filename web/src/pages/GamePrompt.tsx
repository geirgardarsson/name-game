// pages/GamePrompt.tsx
import { useState } from "react";
import { useJoinGame } from "@/hooks/useJoinGame";
import { Spinner } from "@/components/ui/Spinner";
import { Toast } from "@/components/ui/Toast";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/Button";
import { GameCodeInput } from "@/components/ui/GameCodeInput";
import React from "react";

export default function GamePrompt() {
  const [code, setCode] = useState("");
  const navigate = useNavigate();
  const { data, loading, error, joinGame } = useJoinGame();

  React.useEffect(() => {
    if (data && data.id) {
      navigate(`/play/${data.id}`);
    }
  }, [data, navigate]);

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!code.trim()) return;
    joinGame(code);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen gap-4 bg-gradient-to-br from-purple-100 to-orange-200">
      {error && <Toast message={error} color="red" />}
      <h1 className="text-3xl font-bold">Sláðu inn kóða</h1>
      <form className="flex gap-2" onSubmit={handleSubmit}>
        <GameCodeInput value={code} onChange={setCode} />
        <Button type="submit" disabled={loading}>
          {loading ? <Spinner size={20} /> : "Áfram"}
        </Button>
      </form>
    </div>
  );
}
