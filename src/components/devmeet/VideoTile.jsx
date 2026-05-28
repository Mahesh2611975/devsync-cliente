import React, { useEffect, useRef } from 'react';

export default function VideoTile({ stream, isLocal, userName, micEnabled, cameraEnabled }) {
  const videoRef = useRef(null);

  // Safely bind the live MediaStream track data to the HTML5 video element on status change
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log(`🎬 Attaching MediaStream track pointer onto VideoTile DOM target [${userName}]`);
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Determine if we should physically render our active video playback node element
  const showVideoFeed = cameraEnabled && stream;

  return (
    <div className="bg-neutral-900/60 border border-white/10 rounded-xl relative overflow-hidden aspect-video w-full h-full shadow-2xl flex items-center justify-center group transition hover:border-white/20">
      
      {/* ✅ PERSISTENT VIDEO NODE: Uses tailwind hidden logic to prevent runtime initialization dropout drops */}
      <video 
        ref={videoRef}
        autoPlay 
        playsInline 
        muted={isLocal} 
        className={`w-full h-full object-cover scale-x-[-1] ${showVideoFeed ? 'block' : 'hidden'}`}
      />

      {/* ✅ AVATAR PLACEHOLDER LAYER: Replaces screen space gracefully if webcam is active status turned off */}
      {!showVideoFeed && (
        <div className="absolute inset-0 w-full h-full bg-[#141416] flex flex-col items-center justify-center gap-3 animate-fade-in">
          <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10 text-lg font-mono font-bold text-zinc-400 select-none shadow-inner">
            {userName?.match(/\d+/) ? `#${userName.match(/\d+/)[0]}` : userName?.charAt(0) || 'D'}
          </div>
          <span className="text-[11px] font-mono text-zinc-500 tracking-wider uppercase">Camera Off</span>
        </div>
      )}

      {/* Interface Information Gradient Overlay Layout */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-100 pointer-events-none" />
      
      {/* Runtime Network Profile Status Sub-badges */}
      <div className="absolute bottom-3 left-3 flex items-center gap-2 pointer-events-none z-20">
        <span className="text-xs font-semibold text-white bg-black/60 px-2.5 py-1 rounded-md border border-white/5 backdrop-blur-md">
          {userName}
        </span>
        
        {!micEnabled && (
          <span className="bg-red-500/20 text-red-400 border border-red-500/30 px-2 py-1 rounded-md backdrop-blur-md text-[10px] uppercase font-bold tracking-wider">
            制 Muted
          </span>
        )}
      </div>
    </div>
  );
}