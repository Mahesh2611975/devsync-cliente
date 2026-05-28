import React from "react";
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

        {/* Real-time Workspace Base Views */}
        <Route path="/workspace/:workspaceId" element={<WorkspaceDashboard />} />
        <Route path="/team/:teamId" element={<WorkspaceDashboard />} />

        {/* Dynamic Contextual Feature Target Views inside a Workspace */}
        <Route path="/workspace/:workspaceId/feature/:featureId" element={<WorkspaceDashboard />} />
        {/* 🚀 FIX: This handles the /team/:teamId/feature/:featureId navigation paths from your Sidebar button clicks */}
        <Route path="/team/:teamId/feature/:featureId" element={<WorkspaceDashboard />} />

        {/* Match the active channel routing architecture */}
        <Route path="/team/:teamId/channel/:channelId" element={<WorkspaceDashboard />} />
        <Route path="/workspace/:workspaceId/channel/:channelId" element={<WorkspaceDashboard />} />

        {/* Fallback Catch-All Redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}