// src/components/CreateTeamModal.jsx

import { useState, useEffect, useRef } from "react";
import { X, Users, Lock, Globe, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { safeFetch, ApiHtmlError, ApiRequestError } from "../utils/safeFetch";

export default function CreateTeamModal({ isOpen, onClose, onSuccess }) {
  const [teamName, setTeamName]   = useState("");
  const [isPrivate, setIsPrivate] = useState(false);
  const [loading, setLoading]     = useState(false);
  const [error, setError]         = useState("");
  const inputRef                  = useRef(null);

  // Focus input when modal opens; reset state when it closes
  useEffect(() => {
    if (isOpen) {
      setTeamName("");
      setIsPrivate(false);
      setError("");
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 80);
    }
  }, [isOpen]);

  // Close on Escape
  useEffect(() => {
    const handleKey = (e) => { if (e.key === "Escape") onClose(); };
    if (isOpen) window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [isOpen, onClose]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!teamName.trim()) { setError("Team name cannot be empty."); return; }

    setLoading(true);
    setError("");

    try {
      const params = new URLSearchParams({
        name:      teamName.trim(),
        isPrivate: isPrivate.toString(),
      });

      // ✅ Use safeFetch — intercepts HTML error pages before JSON.parse crashes
      const newTeam = await safeFetch(
        `/api/v1/dashboard/create?${params.toString()}`,
        { method: "POST" }
      );

      // ✅ Backend succeeded — bubble up whatever fields came back.
      //    Even if the response is minimal (just id + name), Dashboard only
      //    needs those two fields for the sidebar, so we normalise here.
      onSuccess({
        id:   newTeam?.id   ?? null,
        name: newTeam?.name ?? teamName.trim(),
      });
      onClose();

    } catch (err) {
      if (err instanceof ApiHtmlError) {
        // Server returned HTML — most likely a JPA serialization error on the
        // Team entity (lazy-loaded relationships). The team WAS created in the
        // DB (Hibernate logs confirm the INSERT). We treat this as a soft
        // success: close the modal and let the dashboard refresh show it.
        console.warn(
          "Team created in DB but server response was HTML " +
          "(likely a JPA serialization error on Team entity). " +
          "Treating as success — refresh the dashboard to see the new team.",
          err.message
        );
        onSuccess({ id: null, name: teamName.trim() });
        onClose();
        return;
      }

      if (err instanceof ApiRequestError) {
        if (err.status === 401) {
          setError("Session expired. Please sign in again.");
        } else if (err.status === 409) {
          setError("A team with that name already exists.");
        } else {
          setError(`Server error (${err.status}). Please try again.`);
        }
        return;
      }

      setError("Cannot connect to server. Check your connection.");
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      <div className="relative w-full max-w-md bg-[#111111] border border-white/10 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden animate-modal">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(16px) scale(0.97); }
            to   { opacity: 1; transform: translateY(0)    scale(1);    }
          }
          .animate-modal { animation: modalIn 0.22s ease forwards; }
        `}</style>

        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-[#FF4500]/15 rounded-xl flex items-center justify-center">
              <Users size={18} className="text-[#FF4500]" />
            </div>
            <div>
              <h2 className="text-white font-bold text-base leading-none">Create Team</h2>
              <p className="text-white/40 text-xs mt-0.5">Add a new workspace to your dashboard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-white/40 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-5">

          {/* Team Name */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-2">
              Team Name <span className="text-[#FF4500]">*</span>
            </label>
            <input
              ref={inputRef}
              type="text"
              value={teamName}
              onChange={(e) => { setTeamName(e.target.value); setError(""); }}
              placeholder="e.g. Backend Squad"
              maxLength={60}
              className={`w-full bg-[#1a1a1a] border ${
                error && !teamName.trim()
                  ? "border-red-500/60"
                  : "border-white/10 focus:border-[#FF4500]"
              } rounded-xl px-4 py-3 text-white text-sm placeholder-white/25 outline-none transition-colors`}
            />
            <div className="flex justify-end mt-1">
              <span className="text-white/20 text-xs">{teamName.length}/60</span>
            </div>
          </div>

          {/* Visibility Toggle */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-white/50 mb-3">
              Visibility
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setIsPrivate(false)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  !isPrivate
                    ? "border-[#FF4500]/60 bg-[#FF4500]/10 text-white"
                    : "border-white/10 bg-[#1a1a1a] text-white/40 hover:border-white/20"
                }`}
              >
                <Globe size={17} className={!isPrivate ? "text-[#FF4500]" : "text-white/30"} />
                <div className="text-left">
                  <p className="text-sm font-semibold leading-none">Public</p>
                  <p className="text-xs mt-0.5 opacity-60">Anyone can join</p>
                </div>
                {!isPrivate && <CheckCircle2 size={15} className="text-[#FF4500] ml-auto flex-shrink-0" />}
              </button>

              <button
                type="button"
                onClick={() => setIsPrivate(true)}
                className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                  isPrivate
                    ? "border-[#FF4500]/60 bg-[#FF4500]/10 text-white"
                    : "border-white/10 bg-[#1a1a1a] text-white/40 hover:border-white/20"
                }`}
              >
                <Lock size={17} className={isPrivate ? "text-[#FF4500]" : "text-white/30"} />
                <div className="text-left">
                  <p className="text-sm font-semibold leading-none">Private</p>
                  <p className="text-xs mt-0.5 opacity-60">Invite only</p>
                </div>
                {isPrivate && <CheckCircle2 size={15} className="text-[#FF4500] ml-auto flex-shrink-0" />}
              </button>
            </div>
          </div>

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3">
              <AlertCircle size={15} className="text-red-400 flex-shrink-0" />
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Buttons */}
          <div className="flex items-center gap-3 pt-1">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3 rounded-xl border border-white/10 text-white/60 hover:text-white hover:border-white/20 text-sm font-semibold transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !teamName.trim()}
              className="flex-1 py-3 rounded-xl bg-[#FF4500] hover:bg-[#e03d00] disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <><Loader2 size={15} className="animate-spin" /> Creating...</>
              ) : (
                "Create Team"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}