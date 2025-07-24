import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import "./index.css";
import GamePrompt from "./pages/GamePrompt";
import GameDisplay from "./pages/GameDisplay";
import ParticipantView from "./pages/ParticipantView";
import PrepareGameDisplay from "./pages/PrepareGameDisplay";

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<GamePrompt />} />
        <Route path="/play" element={<GamePrompt />} />
        <Route path="/display" element={<PrepareGameDisplay />} />
        <Route path="/display/:gameId" element={<GameDisplay />} />
        <Route path="/play/:gameId" element={<ParticipantView />} />
      </Routes>
    </BrowserRouter>
  </React.StrictMode>
);
