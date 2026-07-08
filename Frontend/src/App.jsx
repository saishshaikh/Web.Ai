import { Routes, Route, Navigate } from "react-router-dom";
import { useSelector } from "react-redux";
import { Loader2 } from "lucide-react";

import Home from "./pages/Home";
import Dashboard from "./pages/Dashboard";
import Generate from "./pages/Generate";
import Editor from "./pages/Editor";
import useGetCurrentUser from "./hooks/GetCurrentUser";
import LiveSite from "./pages/LiveSite";
import Pricing from "./pages/Pricing";

// Dynamically use production server when deployed, fallback to localhost
export const serverUrl = import.meta.env?.VITE_SERVER_URL || "http://localhost:8000";

function App() {
  // Trigger background token checking & populate Redux store
  useGetCurrentUser();

  // Pull both user data AND the auth verification pending state
  const { userData, loading } = useSelector((state) => state.user);

  // Guard against flash-redirects during the initial handshake
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex flex-col items-center justify-center text-zinc-400 font-medium">
        <Loader2 className="animate-spin text-white mb-2" size={28} />
        <span>Syncing session security...</span>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public Landing Area */}
      <Route path="/" element={<Home />} />
      <Route path="/pricing" element={<Pricing />} />

      {/* Live Site Rendering */}
      <Route path="/site/:slug" element={<LiveSite />} />

      {/* Protected Architectural Modules */}
      <Route
        path="/dashboard"
        element={userData ? <Dashboard /> : <Navigate to="/" replace />}
      />

      <Route
        path="/generate"
        element={userData ? <Generate /> : <Navigate to="/" replace />}
      />

      {/* PUBLIC ROUTE: Editor */}
      <Route path="/editor/:id" element={<Editor />} />

      {/* Wildcard Catch-All Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default App;