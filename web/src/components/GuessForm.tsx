import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { GiInvertedDice6 } from "react-icons/gi";
import React, { useRef, useEffect, useState } from "react";
import { API_URL } from "@/config";
import { useGame } from "@/context/GameContext";

interface GuessFormProps {
  gameId: string;
  username: string;
  onGuessSubmitted?: () => void;
}

export default function GuessForm({
  gameId,
  username,
  onGuessSubmitted,
}: GuessFormProps) {
  const [guess, setGuess] = useState("");
  const [namesList, setNamesList] = useState<string[]>([]);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeSuggestion, setActiveSuggestion] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const { status } = useGame();
  const { data, isLoading } = status;

  useEffect(() => {
    async function loadNames() {
      try {
        const res = await fetch("/names.txt");
        if (!res.ok) throw new Error("Failed to load names.txt");
        const text = await res.text();
        setNamesList(text.split(/\r?\n/).filter(Boolean));
      } catch (e) {
        console.error(e);
      }
    }
    loadNames();
  }, []);

  // Autofill logic: update suggestions when guess changes
  useEffect(() => {
    const parts = guess.split(" ");
    const current = parts[parts.length - 1];
    if (current.length === 0) {
      setSuggestions([]);
      setShowSuggestions(false);
      setActiveSuggestion(-1);
      return;
    }
    const filtered = namesList.filter((name) =>
      name.toLowerCase().startsWith(current.toLowerCase())
    );
    const limited = filtered.slice(0, 8); // limit to 8 suggestions
    setSuggestions(limited);
    // Close dropdown if only one result and it matches input exactly
    if (limited.length === 1 && limited[0].toLowerCase() === current.toLowerCase()) {
      setShowSuggestions(false);
    } else {
      setShowSuggestions(limited.length > 0);
    }
    setActiveSuggestion(-1);
  }, [guess, namesList]);

  useEffect(() => {
    if (guess === "" && inputRef.current) {
      inputRef.current.focus();
    }
  }, [guess]);

  async function submitGuess() {
    if (!guess.trim()) return;
    const res = await fetch(`${API_URL}/game/${gameId}/guess`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user: username, guess }),
    });
    if (!res.ok) {
      console.error("Failed to submit guess", res.statusText);
    } else {
      setGuess("");
      if (inputRef.current) inputRef.current.focus();
      if (onGuessSubmitted) onGuessSubmitted();
    }
  }

  function randomizeGuess() {
    if (namesList.length < 2) return;
    const shuffled = namesList.slice().sort(() => 0.5 - Math.random());
    setGuess(`${shuffled[0]} ${shuffled[1]}`);
    if (inputRef.current) inputRef.current.focus();
    setShowSuggestions(false);
  }

  function handleSuggestionClick(suggestion: string) {
    const parts = guess.split(" ");
    parts[parts.length - 1] = suggestion;
    const newGuess = parts.join(" ") + " "; // add space for next name
    setGuess(newGuess);
    setShowSuggestions(false);
    setActiveSuggestion(-1);
    if (inputRef.current) inputRef.current.focus();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!showSuggestions || suggestions.length === 0) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev < suggestions.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveSuggestion((prev) =>
        prev > 0 ? prev - 1 : suggestions.length - 1
      );
    } else if (e.key === "Enter" && activeSuggestion >= 0) {
      e.preventDefault();
      handleSuggestionClick(suggestions[activeSuggestion]);
    } else if (e.key === "Escape") {
      setShowSuggestions(false);
      setActiveSuggestion(-1);
    }
  }

  const disabled = isLoading || !data || data.status !== "Active";

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        submitGuess();
      }}
      className="flex gap-2"
      autoComplete="off"
    >
      <div className="relative flex-1">
        <Input
          inputRef={inputRef}
          value={guess}
          onChange={(e) => setGuess(e.target.value)}
          onKeyDown={handleInputKeyDown}
          placeholder="Your guess"
          className="pr-10" // add right padding for the icon button
          autoComplete="off"
        />
        <button
          type="button"
          onClick={randomizeGuess}
          tabIndex={-1}
          className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-gray-700 hover:text-gray-800 disabled:text-gray-300 bg-transparent border-none focus:outline-none"
          aria-label="Randomize guess"
        >
          <GiInvertedDice6 size={24} />
        </button>
        {/* Autofill dropdown */}
        {showSuggestions && suggestions.length > 0 && (
          <ul className="absolute z-10 left-0 right-0 mt-1 bg-white border border-gray-200 rounded shadow-lg max-h-48 overflow-y-auto">
            {suggestions.map((s, i) => (
              <li
                key={s}
                className={`px-3 py-2 cursor-pointer hover:bg-gray-100 ${
                  i === activeSuggestion ? "bg-gray-200" : ""
                }`}
                onMouseDown={() => handleSuggestionClick(s)}
                onMouseEnter={() => setActiveSuggestion(i)}
              >
                {s}
              </li>
            ))}
          </ul>
        )}
      </div>
      <Button type="submit" disabled={disabled}>
        Guess
      </Button>
    </form>
  );
}
