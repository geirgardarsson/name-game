import { useState } from "react";
import { API_URL } from "@/config";

export function useJoinGame() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const joinGame = async (code: string) => {
        setLoading(true);
        setError(null);
        setData(null);
        try {
            const response = await fetch(`${API_URL}/game/join/${code}`, {
                method: "GET",
            });
            if (!response.ok) {
                const errText = await response.text();
                throw new Error(errText || "Failed to join game");
            }
            const result = await response.json();
            setData(result);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Unknown error");
            } else {
                setError("Unknown error");
            }
        } finally {
            setLoading(false);
        }
    };

    return { data, loading, error, joinGame };
}
