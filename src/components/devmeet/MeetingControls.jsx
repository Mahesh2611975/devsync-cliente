import React, { useState, useEffect } from 'react';

export default function MeetingControls({ 
  meetingId, 
  initialMic = true, 
  initialCamera = true, 
  initialScreen = false, 
  onMicToggle, 
  onCameraToggle, 
  onScreenToggle, 
  onLeave 
}) {
  // Sync state initializations safely
  const [mic, setMic] = useState(initialMic);
  const [camera, setCamera] = useState(initialCamera);
  const [screen, setScreen] = useState(initialScreen);
  const token = localStorage.getItem('token');

  // Safely extract the raw database numeric ID if it comes in prefixed (e.g., "meet-1" -> "1")
  const numericMeetingId = typeof meetingId === 'string' 
    ? meetingId.replace('meet-', '') 
    : meetingId;

  // Effect to synchronize local control states with incoming stream states
  useEffect(() => {
    setMic(initialMic);
  }, [initialMic]);

  useEffect(() => {
    setCamera(initialCamera);
  }, [initialCamera]);

  useEffect(() => {
    setScreen(initialScreen);
  }, [initialScreen]);

  const handleMicClick = async () => {
    const newState = !mic;
    setMic(newState);
    if (onMicToggle) onMicToggle(newState);
    
    try {
      await fetch(`http://localhost:8080/api/meetings/${numericMeetingId}/mic?enabled=${newState}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to sync Microphone state to backend registry cluster:", e);
    }
  };

  const handleCameraClick = async () => {
    const newState = !camera;
    setCamera(newState);
    if (onCameraToggle) onCameraToggle(newState);
    
    try {
      await fetch(`http://localhost:8080/api/meetings/${numericMeetingId}/camera?enabled=${newState}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to sync Camera state to backend registry cluster:", e);
    }
  };

  const handleScreenClick = async () => {
    const newState = !screen;
    setScreen(newState);
    if (onScreenToggle) onScreenToggle(newState);
    
    try {
      await fetch(`http://localhost:8080/api/meetings/${numericMeetingId}/screen-share?enabled=${newState}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
    } catch (e) {
      console.error("Failed to sync Screen Share state to backend registry cluster:", e);
    }
  };

  return (
    <div className="flex items-center justify-center gap-4 max-w-xl mx-auto p-4 bg-[#09090b]/80 border border-white/5 rounded-2xl backdrop-blur-md shadow-xl select-none">
      {/* Microphone Control */}
      <button 
        onClick={handleMicClick}
        className={`p-3.5 rounded-xl border font-semibold text-sm transition flex items-center gap-2 duration-200 ${
          mic 
            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20' 
            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
        }`}
      >
        <span>{mic ? "🎙️" : "🔇"}</span>
        <span>{mic ? "Mic On" : "Mic Muted"}</span>
      </button>

      {/* Camera Control */}
      <button 
        onClick={handleCameraClick}
        className={`p-3.5 rounded-xl border font-semibold text-sm transition flex items-center gap-2 duration-200 ${
          camera 
            ? 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20' 
            : 'bg-red-500/10 border-red-500/30 text-red-400 hover:bg-red-500/20'
        }`}
      >
        <span>{camera ? "📹" : "❌"}</span>
        <span>{camera ? "Cam On" : "Cam Off"}</span>
      </button>

      {/* Screen Sharing Control */}
      <button 
        onClick={handleScreenClick}
        className={`p-3.5 rounded-xl border font-semibold text-sm transition flex items-center gap-2 duration-200 ${
          screen 
            ? 'bg-[#FF4500]/20 border-[#FF4500]/40 text-[#FF4500] hover:bg-[#FF4500]/30' 
            : 'bg-white/5 border-white/10 text-white hover:bg-white/10 hover:border-white/20'
        }`}
      >
        <span>🖥️</span>
        <span>{screen ? "Sharing" : "Share Screen"}</span>
      </button>

      {/* Disconnect Action Call Separator Boundary */}
      <div className="h-6 w-px bg-white/10 mx-2" />

      {/* Disconnect Button */}
      <button 
        onClick={onLeave}
        className="px-5 py-3.5 rounded-xl bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm tracking-wide shadow-lg shadow-red-600/10 transition-all duration-200 hover:scale-[1.02]"
      >
        Disconnect
      </button>
    </div>
  );
}