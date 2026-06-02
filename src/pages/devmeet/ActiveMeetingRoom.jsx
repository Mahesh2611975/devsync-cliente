import React from 'react';
import useWebRTC from '../../hooks/useWebRTC';
import VideoTile from '../../components/devmeet/VideoTile';
import MeetingControls from '../../components/devmeet/MeetingControls';
import { getUserIdFromToken } from '../../utils/jwt';

export default function ActiveMeetingRoom({ meeting, onLeave }) {
  const currentUserId = getUserIdFromToken();
  const token = localStorage.getItem('token');

  const {
    localStream,
    remoteStreams,
    participantStates,
    toggleMicTrack,
    toggleCameraTrack,
    toggleScreenTrack,
    leaveRoom
  } = useWebRTC(meeting.meetingId, currentUserId);

  const handleDisconnect = async () => {
    const numericMeetingId = typeof meeting.meetingId === 'string' 
      ? meeting.meetingId.replace('meet-', '') 
      : meeting.meetingId;

    try {
      console.log(`📡 Sending leave notification for Sync Environment Node #${numericMeetingId}`);
      
      await fetch(`http://localhost:8080/api/meetings/leave/${numericMeetingId}`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
    } catch (e) {
      console.error("Failed to synchronize session termination with remote database registry:", e);
    } finally {
      await leaveRoom();
      onLeave();
    }
  };

  return (
    <div className="flex-1 bg-[#09090b] flex flex-col justify-between h-full relative overflow-hidden select-none">

      {/* Top Meta Bar */}
      <div className="p-4 border-b border-white/5 bg-black/40 flex justify-between items-center z-10">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          <span className={`h-2 w-2 rounded-full ${meeting.active ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
          Sync Environment #{meeting.meetingId}
        </h2>
        <div className="text-xs text-gray-500 font-mono">
          Status: {meeting.status || 'OPERATIONAL'}
        </div>
      </div>

      {/* Video Grid Layout */}
      <div className="flex-1 p-6 flex items-center justify-center overflow-y-auto">
        <div className="grid gap-6 w-full h-full max-w-5xl max-h-[70vh] grid-cols-1 md:grid-cols-2 justify-center items-center">

          {/* 1. LOCAL USER CARD */}
          {currentUserId && (
            <VideoTile
              stream={localStream}
              isLocal={true}
              userId={currentUserId}
              userName={`You (#${currentUserId})`}
              micEnabled={participantStates[currentUserId]?.micEnabled ?? true}
              cameraEnabled={participantStates[currentUserId]?.cameraEnabled ?? true}
              screenEnabled={participantStates[currentUserId]?.screenSharing ?? false}
            />
          )}

          {/* 2. DYNAMIC REMOTE PARTICIPANT CARDS */}
          {Object.entries(remoteStreams).map(([peerId, stream]) => (
            <VideoTile
              key={peerId}
              stream={stream}
              isLocal={false}
              userId={peerId}
              userName={`Developer Peer #${peerId}`}
              micEnabled={participantStates[peerId]?.micEnabled ?? true}
              cameraEnabled={participantStates[peerId]?.cameraEnabled ?? true}
              screenEnabled={participantStates[peerId]?.screenSharing ?? false}
            />
          ))}
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="p-6 bg-gradient-to-t from-black via-black/80 to-transparent z-10">
        <MeetingControls
          meetingId={meeting.meetingId}
          initialMic={participantStates[currentUserId]?.micEnabled ?? true}
          initialCamera={participantStates[currentUserId]?.cameraEnabled ?? true}
          initialScreen={participantStates[currentUserId]?.screenSharing ?? false}
          onMicToggle={toggleMicTrack}
          onCameraToggle={toggleCameraTrack}
          onScreenToggle={toggleScreenTrack}
          onLeave={handleDisconnect}
        />
      </div>
    </div>
  );
}