import React, { useState, useEffect } from 'react';
import ActiveMeetingRoom from './ActiveMeetingRoom';

export default function DevMeetDashboard({ teamId }) {
  const [activeMeeting, setActiveMeeting] = useState(null);
  const [ongoingMeetings, setOngoingMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const token = localStorage.getItem('token');

  const fetchOngoingMeetings = async () => {
    if (!token) {
      setError("Authentication token missing. Please log in again.");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch('http://localhost:8080/api/meetings/ongoing', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setOngoingMeetings(data);
        setError(null);
      } else if (res.status === 403) {
        setError("Access Forbidden (403): You don't have permission to view ongoing meetings.");
      } else {
        setError("Failed to fetch running engine operations.");
      }
    } catch (err) {
      console.error(err);
      setError("Server link offline.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (teamId) {
      fetchOngoingMeetings();
      const interval = setInterval(fetchOngoingMeetings, 8000);
      return () => clearInterval(interval);
    }
  }, [teamId]);

  const handleCreateMeeting = async () => {
    if (!token) {
      alert("You must be logged in to host a sync room.");
      return;
    }

    try {
      const res = await fetch(`http://localhost:8080/api/meetings/create/${teamId}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          channelId: teamId, // ✅ FIXED: Replaced null with teamId to fulfill the Postgres NOT NULL constraint
          type: 'CHANNEL' 
        })
      });

      if (res.ok) {
        const newMeeting = await res.json();
        setActiveMeeting(newMeeting);
      } else if (res.status === 403) {
        alert("Error 403 (Forbidden): Authorization failed or access restricted.");
      } else {
        alert(`Failed to create meeting. Status: ${res.status}`);
      }
    } catch (err) {
      console.error("Network error on meeting creation:", err);
    }
  };

  const handleJoinMeeting = async (meetingId) => {
    try {
      const res = await fetch(`http://localhost:8080/api/meetings/join/${meetingId}`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (res.ok) {
        const meetingDetails = await res.json();
        setActiveMeeting(meetingDetails);
      } else if (res.status === 403) {
        alert("Forbidden: You do not have authorization to join this room.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  if (activeMeeting) {
    return (
      <ActiveMeetingRoom 
        meeting={activeMeeting} 
        onLeave={() => {
          setActiveMeeting(null);
          fetchOngoingMeetings();
        }} 
      />
    );
  }

  return (
    <div className="flex-1 bg-[#09090b] text-white p-8 overflow-y-auto select-none">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center border-b border-white/10 pb-6 mb-8">
          <div>
            <h1 className="text-3xl font-black tracking-wider text-white">DevMeet Video</h1>
            <p className="text-gray-400 text-sm mt-1">Live peer-mesh environment synced with your active project cluster.</p>
          </div>
          <button 
            onClick={handleCreateMeeting}
            disabled={!teamId}
            className="bg-[#FF4500] hover:bg-[#ff5d24] disabled:opacity-40 text-white px-5 py-2.5 rounded-lg font-bold text-sm tracking-wide transition shadow-[0_0_15px_rgba(255,69,0,0.3)]"
          >
            📹 Host Sync Room
          </button>
        </div>

        {loading ? (
          <div className="text-gray-500 text-sm animate-pulse">Scanning live network vectors...</div>
        ) : error ? (
          <div className="text-red-500 text-sm bg-red-500/10 p-4 rounded-lg border border-red-500/20">{error}</div>
        ) : ongoingMeetings.length === 0 ? (
          <div className="flex flex-col items-center justify-center border border-dashed border-white/10 rounded-xl p-16 text-center bg-white/[0.01]">
            <span className="text-4xl mb-3">📡</span>
            <h3 className="font-semibold text-gray-300">No Operational Environments</h3>
            <p className="text-gray-500 text-xs mt-1">Spin up an orchestration room to begin collaborating.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {ongoingMeetings.map((meeting) => (
              <div 
                key={meeting.meetingId}
                className="bg-white/[0.02] border border-white/10 rounded-xl p-5 hover:border-[#FF4500]/40 transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-4">
                    <span className="bg-[#FF4500]/10 text-[#FF4500] text-[10px] uppercase font-black tracking-widest px-2 py-0.5 rounded border border-[#FF4500]/20">
                      {meeting.type} Session
                    </span>
                    <span className="text-gray-500 text-xs">ID: #{meeting.meetingId}</span>
                  </div>
                  <h4 className="font-bold text-white text-base">Active Team Hub</h4>
                  <p className="text-gray-400 text-xs mt-1">
                    Current Load: {meeting.participants?.length || 0} peer connections
                  </p>
                </div>
                <button
                  onClick={() => handleJoinMeeting(meeting.meetingId)}
                  className="mt-6 w-full bg-white/5 hover:bg-white/10 text-white border border-white/10 py-2 rounded-lg font-semibold text-xs transition"
                >
                  Join Room Vector
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}