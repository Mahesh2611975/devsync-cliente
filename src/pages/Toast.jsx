// src/components/Toast.jsx

import { useEffect } from "react";
import { CheckCircle2, XCircle, X } from "lucide-react";

/**
 * Props:
 *  message  – string to display
 *  type     – "success" | "error"
 *  onClose  – callback to clear the toast
 *  duration – ms before auto-dismiss (default 3500)
 */
export default function Toast({ message, type = "success", onClose, duration = 3500 }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onClose, duration);
    return () => clearTimeout(t);
  }, [message, duration, onClose]);

  if (!message) return null;

  const isSuccess = type === "success";

  return (
    <div className="fixed bottom-6 right-6 z-[60] animate-toast">
      <style>{`
        @keyframes toastIn {
          from { opacity:0; transform: translateY(12px) scale(0.96); }
          to   { opacity:1; transform: translateY(0)    scale(1);    }
        }
        .animate-toast { animation: toastIn 0.2s ease forwards; }
      `}</style>

      <div className={`flex items-center gap-3 px-5 py-4 rounded-2xl border shadow-2xl shadow-black/40 min-w-[280px] max-w-sm ${
        isSuccess
          ? "bg-[#111111] border-[#c8f135]/30"
          : "bg-[#111111] border-red-500/30"
      }`}>
        {isSuccess
          ? <CheckCircle2 size={18} className="text-[#c8f135] flex-shrink-0" />
          : <XCircle     size={18} className="text-red-400 flex-shrink-0" />
        }
        <p className={`text-sm font-semibold flex-1 ${isSuccess ? "text-white" : "text-white"}`}>
          {message}
        </p>
        <button
          onClick={onClose}
          className="text-white/30 hover:text-white transition-colors ml-2 flex-shrink-0"
        >
          <X size={14} />
        </button>
      </div>
    </div>
  );
}
