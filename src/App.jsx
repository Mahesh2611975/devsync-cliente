import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import LandingPage from "./pages/LandingPage";
import SignUp from "./pages/SignUp";
import SignIn from "./pages/SignIn";
import Dashboard from "./pages/Dashboard";
import WorkspaceDashboard from "./pages/WorkspaceDashboard"; 

export default function App() {
  return (
    <Router>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/signin" element={<SignIn />} />

        {/* Authenticated Summary Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />

        {/* Real-time Workspace Base View */}
        <Route path="/workspace/:workspaceId" element={<WorkspaceDashboard />} />

        {/* CRUCIAL FIX: Match the active channel routing architecture.
          This maps teamId (which maps directly to your workspaceId) and channelId 
          to keep the workspace window mounted during active chats.
        */}
        <Route path="/team/:teamId/channel/:channelId" element={<WorkspaceDashboard />} />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}