import { useEffect, useRef, useState } from 'react';
import { Client } from '@stomp/stompjs';

export default function useWebRTC(meetingId, currentUserId) {
  const [localStream, setLocalStream] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [participantStates, setParticipantStates] = useState({});
  
  const stompClientRef = useRef(null);
  const localStreamRef = useRef(null);
  const peerConnections = useRef({}); // Format: { peerUserId: RTCPeerConnectionInstance }
  const iceQueues = useRef({});       // Format: { peerUserId: [IceCandidates] }

  const rtcConfig = {
    iceServers: [
      { urls: 'stun:stun.l.google.com:19302' },
      { urls: 'stun:stun1.l.google.com:19302' }
    ]
  };

  const sendSignal = (type, payload = {}) => {
    if (stompClientRef.current && stompClientRef.current.connected) {
      const signalBody = {
        meetingId: Number(meetingId),
        senderId: Number(currentUserId),
        signalType: type,
        ...payload
      };
      console.log(`📤 Sending STOMP Signal [${type}] to meeting #${meetingId}`);
      stompClientRef.current.publish({
        destination: '/app/meeting.signal',
        body: JSON.stringify(signalBody)
      });
    }
  };

  useEffect(() => {
    let isMounted = true;
    console.log("🚀 useWebRTC hook mounting for meeting:", meetingId);

    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        if (!isMounted) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        console.log("🎥 Media devices initialized successfully.");
        setLocalStream(stream);
        localStreamRef.current = stream;
        initWebSockets();
      })
      .catch((err) => console.error("Failed to acquire hardware media handles:", err));

    return () => {
      console.log("🧹 useWebRTC cleanup running for meeting:", meetingId);
      isMounted = false;
      leaveRoom();
    };
  }, [meetingId]);

  const initWebSockets = () => {
    if (stompClientRef.current) {
      if (stompClientRef.current.connected) {
        stompClientRef.current.deactivate();
      }
      stompClientRef.current = null;
    }

    const token = localStorage.getItem('token');
    if (!token) {
      console.error("Missing Auth token—skipping socket connection.");
      return;
    }

    const client = new Client({
      brokerURL: 'ws://localhost:8080/ws-raw', 
      connectHeaders: { 'Authorization': `Bearer ${token}` },
      debug: (str) => console.log("🔗 [STOMP Debug]: " + str),
      onConnect: () => {
        console.log("✅ STOMP Client connected successfully.");
        
        client.subscribe(`/topic/meeting/${meetingId}/signals`, (message) => {
          const signalDto = JSON.parse(message.body);
          console.log("📥 Inbound Signal Frame Extracted Payload Object:", signalDto);
          
          if (Number(signalDto.senderId) !== Number(currentUserId)) {
            handleIncomingSignal(signalDto);
          }
        });

        client.subscribe(`/topic/meeting/${meetingId}/states`, (message) => {
          const stateUpdate = JSON.parse(message.body);
          setParticipantStates(prev => ({
            ...prev,
            [stateUpdate.userId]: stateUpdate
          }));
        });

        sendSignal('JOIN');
      },
      onStompError: (frame) => {
        console.error('❌ Broker connection error: ' + frame.headers['message']);
      }
    });

    client.activate();
    stompClientRef.current = client;
  };

  const handleIncomingSignal = async (signal) => {
    try {
      const peerId = signal.senderId;

      if (signal.targetId && Number(signal.targetId) !== Number(currentUserId)) {
        return; 
      }

      const nestedPayload = signal.payload;

      switch (signal.signalType) {
        case 'JOIN':
          console.log(`👥 Processing JOIN from peer #${peerId}`);
          const pcJoin = initializePeerConnection(peerId);
          const offer = await pcJoin.createOffer();
          await pcJoin.setLocalDescription(offer);
          sendSignal('OFFER', { targetId: Number(peerId), payload: offer });
          break;

        case 'OFFER':
          if (!nestedPayload) return;
          console.log(`📥 Processing RECEIVED OFFER from peer #${peerId}`);
          const pcOffer = initializePeerConnection(peerId);
          await pcOffer.setRemoteDescription(new RTCSessionDescription(nestedPayload));
          
          const answer = await pcOffer.createAnswer();
          await pcOffer.setLocalDescription(answer);
          sendSignal('ANSWER', { targetId: Number(peerId), payload: answer });
          break;

        case 'ANSWER':
          if (!nestedPayload) return;
          console.log(`🏁 Processing RECEIVED ANSWER from peer #${peerId}`);
          const pcAnswer = peerConnections.current[peerId];
          if (pcAnswer) {
            await pcAnswer.setRemoteDescription(new RTCSessionDescription(nestedPayload));
            processQueuedCandidates(peerId);
          }
          break;

        case 'ICE_CANDIDATE':
          if (!nestedPayload) return;
          console.log(`🧊 Processing ICE_CANDIDATE from peer #${peerId}`);
          const pcIce = peerConnections.current[peerId];
          
          if (pcIce && pcIce.remoteDescription && pcIce.remoteDescription.type) {
            await pcIce.addIceCandidate(new RTCIceCandidate(nestedPayload));
          } else {
            if (!iceQueues.current[peerId]) iceQueues.current[peerId] = [];
            iceQueues.current[peerId].push(nestedPayload);
          }
          break;

        default:
          console.warn(`Unhandled signal type: ${signal.signalType}`);
      }
    } catch (err) {
      console.error("💥 Signaling processing exception:", err);
    }
  };

  const initializePeerConnection = (peerId) => {
    if (peerConnections.current[peerId]) return peerConnections.current[peerId];

    console.log(`🏗️ Creating brand new RTCPeerConnection for peer [${peerId}]`);
    const pc = new RTCPeerConnection(rtcConfig);

    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => {
        pc.addTrack(track, localStreamRef.current);
      });
    }

    pc.ontrack = (event) => {
      setRemoteStreams(prev => ({ ...prev, [peerId]: event.streams[0] }));
    };

    pc.onicecandidate = (event) => {
      if (event.candidate) {
        sendSignal('ICE_CANDIDATE', { targetId: Number(peerId), payload: event.candidate });
      }
    };

    pc.onconnectionstatechange = () => {
      if (['disconnected', 'failed', 'closed'].includes(pc.connectionState)) {
        removePeer(peerId);
      }
    };

    peerConnections.current[peerId] = pc;
    return pc;
  };

  const processQueuedCandidates = async (peerId) => {
    const pc = peerConnections.current[peerId];
    const queue = iceQueues.current[peerId];
    if (pc && queue && queue.length > 0) {
      while (queue.length > 0) {
        try {
          await pc.addIceCandidate(new RTCIceCandidate(queue.shift()));
        } catch (e) { console.error("Error flushing candidate:", e); }
      }
    }
  };

  const removePeer = (peerId) => {
    if (peerConnections.current[peerId]) {
      peerConnections.current[peerId].close();
      delete peerConnections.current[peerId];
    }
    setRemoteStreams(prev => {
      const copy = { ...prev };
      delete copy[peerId];
      return copy;
    });
  };

  const toggleMicTrack = (enabled) => {
    if (localStreamRef.current) localStreamRef.current.getAudioTracks().forEach(t => t.enabled = enabled);
    sendSignal('STATE_UPDATE', { payload: { type: 'MIC', enabled } });
  };

  const toggleCameraTrack = (enabled) => {
    if (localStreamRef.current) localStreamRef.current.getVideoTracks().forEach(t => { 
      if (!t.label.toLowerCase().includes('screen')) t.enabled = enabled; 
    });
    sendSignal('STATE_UPDATE', { payload: { type: 'CAM', enabled } });
  };

  const toggleScreenTrack = (enabled) => {
    if (localStreamRef.current) localStreamRef.current.getVideoTracks().forEach(t => { 
      if (t.label.toLowerCase().includes('screen')) t.enabled = enabled; 
    });
    sendSignal('STATE_UPDATE', { payload: { type: 'SCREEN', enabled } });
  };

  const leaveRoom = () => {
    if (stompClientRef.current) {
      stompClientRef.current.deactivate();
      stompClientRef.current = null;
    }
    Object.keys(peerConnections.current).forEach(id => peerConnections.current[id].close());
    peerConnections.current = {};
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    setRemoteStreams({});
  };

  return { localStream, remoteStreams, participantStates, toggleMicTrack, toggleCameraTrack, toggleScreenTrack, leaveRoom };
}