import { useState } from "react";
import { useNavigate } from "react-router-dom"; // 1. Added React Router Hook

export default function SignIn() { // 2. Removed navigate from props parameters
  const navigate = useNavigate(); // 3. Initialized the hook
  
  const [form, setForm] = useState({ email: "", password: "", remember: false });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");

  const validate = () => {
    const e = {};
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    if (!form.password) e.password = "Password is required";
    return e;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === "checkbox" ? checked : value }));
    setErrors(err => ({ ...err, [name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    
    setLoading(true);
    setApiError("");

    try {
      const res = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: form.email,
          password: form.password,
        }),
      });

      if (res.ok) {
        const data = await res.json().catch(() => ({}));

        // Store JWT token
        if (data.token) {
          localStorage.setItem("token", data.token);
        }

        // Remember user
        if (form.remember) {
          localStorage.setItem(
            "ds_user",
            JSON.stringify({
              email: form.email,
              token: data.token || ""
            })
          );
        }

        // 4. Updated destination to standard routing path
        navigate("/dashboard");

      } else {
        const data = await res.json().catch(() => ({}));
        setApiError(data.message || "Invalid email or password.");
      }

    } catch (error) {
      console.error(error);
      setApiError("Cannot connect to server. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex font-['Space_Grotesk',sans-serif]">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Bebas+Neue&display=swap');
        .font-bebas { font-family: 'Bebas Neue', cursive; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.5s ease forwards; }
        .input-field {
          background: #111;
          border: 1px solid rgba(255,255,255,0.1);
          color: white;
          padding: 0.875rem 1rem;
          width: 100%;
          outline: none;
          transition: border-color 0.2s;
          font-family: 'Space Grotesk', sans-serif;
          font-size: 0.9rem;
        }
        .input-field:focus { border-color: #FF4500; }
        .input-field.error { border-color: #ef4444; }
        .input-field::placeholder { color: rgba(255,255,255,0.3); }
        .custom-check { appearance: none; width: 18px; height: 18px; border: 1px solid rgba(255,255,255,0.2); background: #111; cursor: pointer; position: relative; flex-shrink: 0; }
        .custom-check:checked { background: #FF4500; border-color: #FF4500; }
        .custom-check:checked::after { content: '✓'; position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); color: white; font-size: 11px; font-weight: bold; }
      `}</style>

      {/* LEFT PANEL — Form Interface */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md fade-up">
          {/* Mobile Logo */}
          <div className="lg:hidden mb-8 text-center">
            <button onClick={() => navigate("/")} className="font-bebas text-3xl tracking-widest text-[#FF4500]">
              DEV<span className="text-white">SYNC</span>
            </button>
          </div>

          <div className="mb-8">
            <p className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.3em] mb-2">— Welcome Back</p>
            <h1 className="font-bebas text-5xl text-white tracking-wide">SIGN IN</h1>
            <p className="text-white/50 text-sm mt-2">Pick up right where you left off.</p>
          </div>

          {/* API Errors */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 mb-6">
              <p className="text-red-400 text-sm font-medium">⚠ {apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Email Field */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                disabled={loading}
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`input-field ${errors.email ? "error" : ""} disabled:opacity-50`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.email}</p>}
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/60">Password</label>
                <button 
                  type="button" 
                  onClick={() => navigate("/forgot-password")}
                  className="text-xs text-[#FF4500] hover:underline font-medium"
                >
                  Forgot Password?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  disabled={loading}
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Your password"
                  autoComplete="current-password"
                  className={`input-field pr-12 ${errors.password ? "error" : ""} disabled:opacity-50`}
                />
                <button
                  type="button"
                  disabled={loading}
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>
              {errors.password && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.password}</p>}
            </div>

            {/* Remember Me Option */}
            <label className="flex items-center gap-3 cursor-pointer group">
              <input
                type="checkbox"
                name="remember"
                disabled={loading}
                checked={form.remember}
                onChange={handleChange}
                className="custom-check disabled:opacity-50"
              />
              <div>
                <span className="text-sm text-white/70 group-hover:text-white transition-colors font-medium">Remember me</span>
                <p className="text-white/30 text-xs">Stay signed in on this device</p>
              </div>
            </label>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#FF4500] hover:bg-[#e03d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm py-4 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4 text-white" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                  </svg>
                  {" "}Signing In...
                </                >
              ) : "Sign In ↗"}
            </button>
          </form>

          {/* HR Divider */}
          <div className="flex items-center gap-4 my-8">
            <div className="flex-1 h-px bg-white/10"></div>
            <span className="text-white/30 text-xs uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-white/10"></div>
          </div>

          {/* Third-Party Integrations */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { name: "GitHub", icon: "GH" },
              { name: "Google", icon: "G" },
            ].map(s => (
              <button
                key={s.name}
                type="button"
                disabled={loading}
                className="flex items-center justify-center gap-2 border border-white/10 hover:border-white/30 bg-[#111] text-white/70 hover:text-white py-3 text-sm font-medium transition-all disabled:opacity-40"
              >
                <span className="text-xs font-bold text-[#FF4500]">[{s.icon}]</span>
                {s.name}
              </button>
            ))}
          </div>

          {/* Registration Redirect */}
          <p className="text-center text-white/40 text-sm mt-8">
            Don't have an account?{" "}
            <button onClick={() => !loading && navigate("/signup")} className="text-[#FF4500] font-bold hover:underline transition-all disabled:opacity-50">
              Sign Up →
            </button>
          </p>

          {/* Back Home Link */}
          <button
            onClick={() => !loading && navigate("/")}
            className="mt-4 w-full text-center text-white/20 hover:text-white/50 text-xs transition-colors disabled:opacity-50"
          >
            ← Back to Home
          </button>
        </div>
      </div>

      {/* RIGHT PANEL — Brand Side-Text Showcase */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#0d0d0d] border-l border-white/5 flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#FF4500]/5 rounded-full -translate-y-32 translate-x-32 pointer-events-none"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-[#FF4500]/5 rounded-full translate-y-24 -translate-x-24 pointer-events-none"></div>

        <button onClick={() => navigate("/")} className="text-left font-bebas text-3xl tracking-widest text-[#FF4500] z-10">
          DEV<span className="text-white">SYNC</span>
        </button>

        <div className="z-10">
          <div className="border-l-4 border-[#FF4500] pl-6 mb-10">
            <p className="font-bebas text-6xl text-white leading-none mb-3">WELCOME<br />BACK.</p>
            <p className="text-white/50 text-sm leading-relaxed">Your team is waiting. Jump back in and keep the momentum going.</p>
          </div>

          {/* Recent Live Activity Logs */}
          <div className="flex flex-col gap-3">
            <p className="text-white/30 text-xs font-bold uppercase tracking-widest mb-1">— What's Happening</p>
            {[
              { icon: "📡", msg: "3 new pull requests need your review", time: "2m ago", color: "#FF4500" },
              { icon: "✅", msg: "Deploy to staging — completed", time: "14m ago", color: "#c8f135" },
              { icon: "💬", msg: "Team standup notes shared", time: "1h ago", color: "#60a5fa" },
            ].map((a, i) => (
              <div key={i} className="bg-[#111] border border-white/5 p-4 flex items-center gap-3 hover:border-[#FF4500]/30 transition-colors">
                <span className="text-xl">{a.icon}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-white/80 text-xs font-medium truncate">{a.msg}</p>
                  <p className="text-white/30 text-xs">{a.time}</p>
                </div>
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: a.color }}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Analytical Platform Statistics */}
        <div className="z-10 flex items-center gap-6 border-t border-white/10 pt-6">
          <div>
            <p className="font-bebas text-4xl text-[#FF4500]">12K+</p>
            <p className="text-white/40 text-xs uppercase tracking-wider">Active Devs</p>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div>
            <p className="font-bebas text-4xl text-white">98%</p>
            <p className="text-white/40 text-xs uppercase tracking-wider">Uptime</p>
          </div>
          <div className="w-px h-10 bg-white/10"></div>
          <div>
            <p className="font-bebas text-4xl text-[#c8f135]">4.9★</p>
            <p className="text-white/40 text-xs uppercase tracking-wider">Rated</p>
          </div>
        </div>
      </div>
    </div>
  );
}