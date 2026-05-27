import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function getPasswordStrength(password) {
  let score = 0;
  if (!password) return { score: 0, label: "", color: "" };
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score: 1, label: "Weak", color: "#ef4444", bg: "bg-red-500" };
  if (score === 2) return { score: 2, label: "Fair", color: "#f97316", bg: "bg-orange-500" };
  if (score === 3) return { score: 3, label: "Good", color: "#eab308", bg: "bg-yellow-500" };
  if (score === 4) return { score: 4, label: "Strong", color: "#22c55e", bg: "bg-green-500" };
  return { score: 5, label: "Very Strong", color: "#c8f135", bg: "bg-[#c8f135]" };
}

export default function SignUp() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({ username: "", email: "", password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const strength = getPasswordStrength(form.password);

  // Safely manage the redirect timeout on component unmount
  useEffect(() => {
    let timeoutId;
    if (success) {
      timeoutId = setTimeout(() => navigate("/signin"), 2000); // Added slash for standard routing
    }
    return () => {
      if (timeoutId) clearTimeout(timeoutId);
    };
  }, [success, navigate]);

  const validate = () => {
    const e = {};
    if (!form.username.trim()) e.username = "Username is required";
    else if (form.username.length < 3) e.username = "Username must be at least 3 characters";
    
    if (!form.email.trim()) e.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = "Enter a valid email address";
    
    if (!form.password) e.password = "Password is required";
    else if (form.password.length < 8) e.password = "Password must be at least 8 characters";
    
    if (!form.confirmPassword) e.confirmPassword = "Please confirm your password";
    else if (form.password !== form.confirmPassword) e.confirmPassword = "Passwords do not match";
    return e;
  };

  const handleChange = (e) => {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
    setErrors(err => ({ ...err, [e.target.name]: "" }));
    setApiError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    setLoading(true);
    setApiError("");
    try {
      const res = await fetch("http://localhost:8080/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          username: form.username,
          email: form.email,
          password: form.password,
        }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json().catch(() => ({}));
        setApiError(data.message || "Signup failed. Please try again.");
      }
    } catch {
      setApiError("Cannot connect to server. Please try again later.");
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
        @keyframes successPop { 0% { transform: scale(0.8); opacity:0; } 100% { transform: scale(1); opacity:1; } }
        .success-pop { animation: successPop 0.4s ease forwards; }
      `}</style>

      {/* LEFT PANEL — branding */}
      <div className="hidden lg:flex lg:w-[45%] bg-[#FF4500] flex-col justify-between p-12 relative overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center overflow-hidden pointer-events-none select-none">
          <span className="font-bebas text-[20rem] text-white/5 leading-none">DS</span>
        </div>

        <button onClick={() => navigate("/landing")} className="font-bebas text-3xl tracking-widest text-white z-10 text-left">
          DEV<span className="text-black">SYNC</span>
        </button>

        <div className="z-10">
          <p className="text-white/70 text-xs font-bold uppercase tracking-[0.3em] mb-4">— Join the Platform</p>
          <h2 className="font-bebas text-7xl text-white leading-none mb-6">
            BUILD.<br />
            SHIP.<br />
            <span className="text-black">REPEAT.</span>
          </h2>
          <p className="text-white/80 text-sm leading-relaxed max-w-xs">
            Join over 12,000 developers who use DevSync to collaborate in real-time, review code faster, and ship with confidence.
          </p>

          <div className="mt-10 flex flex-col gap-3">
            {["Real-time collaborative code editor", "Smart pull-request workflows", "One-click deployment pipelines", "Powerful team analytics"].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <span className="w-5 h-5 rounded-full bg-black flex items-center justify-center text-[10px] font-bold text-[#FF4500] flex-shrink-0">✓</span>
                <span className="text-white/90 text-sm font-medium">{f}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="z-10 border-t border-white/20 pt-6">
          <p className="text-white/70 text-sm italic">"DevSync shipped us 3x faster. It's not a tool — it's a superpower."</p>
          <p className="text-black font-bold text-xs mt-2">— Divyan Singhavi, CTO at TripleDart</p>
        </div>
      </div>

      {/* RIGHT PANEL — form */}
      <div className="flex-1 flex items-center justify-center px-6 py-12 overflow-y-auto">
        <div className="w-full max-w-md fade-up">
          <div className="lg:hidden mb-8 text-center">
            <button onClick={() => navigate("/landing")} className="font-bebas text-3xl tracking-widest text-[#FF4500]">
              DEV<span className="text-white">SYNC</span>
            </button>
          </div>

          <div className="mb-8">
            <p className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.3em] mb-2">— Get Started Free</p>
            <h1 className="font-bebas text-5xl text-white tracking-wide">CREATE ACCOUNT</h1>
            <p className="text-white/50 text-sm mt-2">Start building with your team in minutes.</p>
          </div>

          {/* Success State */}
          {success && (
            <div className="success-pop bg-[#c8f135]/10 border border-[#c8f135]/30 p-4 mb-6 text-center">
              <p className="text-[#c8f135] font-bold text-sm">✓ Account created successfully!</p>
              <p className="text-white/50 text-xs mt-1">Redirecting to Sign In...</p>
            </div>
          )}

          {/* API Error */}
          {apiError && (
            <div className="bg-red-500/10 border border-red-500/30 p-4 mb-6">
              <p className="text-red-400 text-sm font-medium">⚠ {apiError}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-5">
            {/* Username */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Username</label>
              <input
                name="username"
                value={form.username}
                onChange={handleChange}
                placeholder="e.g. john_dev"
                autoComplete="username"
                className={`input-field ${errors.username ? "error" : ""}`}
              />
              {errors.username && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.username}</p>}
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Email Address</label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={`input-field ${errors.email ? "error" : ""}`}
              />
              {errors.email && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.email}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Password</label>
              <div className="relative">
                <input
                  type={showPass ? "text" : "password"}
                  name="password"
                  value={form.password}
                  onChange={handleChange}
                  placeholder="Min. 8 characters"
                  autoComplete="new-password"
                  className={`input-field pr-12 ${errors.password ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  {showPass ? "HIDE" : "SHOW"}
                </button>
              </div>

              {/* Password Strength Indicator */}
              {form.password && (
                <div className="mt-2.5">
                  <div className="flex gap-1 mb-1.5">
                    {[1, 2, 3, 4, 5].map(i => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-sm transition-all duration-300 ${i <= strength.score ? strength.bg : "bg-white/10"}`}
                      />
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-xs font-bold" style={{ color: strength.color }}>
                      {strength.label}
                    </p>
                    <p className="text-white/30 text-xs">
                      {form.password.length < 8 ? "Use 8+ chars, uppercase, numbers & symbols" :
                       !/[A-Z]/.test(form.password) ? "Add uppercase letters" :
                       !/[0-9]/.test(form.password) ? "Add numbers" :
                       !/[^A-Za-z0-9]/.test(form.password) ? "Add symbols" : "Great password!"}
                    </p>
                  </div>
                </div>
              )}
              {errors.password && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.password}</p>}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-white/60 block mb-2">Confirm Password</label>
              <div className="relative">
                <input
                  type={showConfirm ? "text" : "password"}
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter your password"
                  autoComplete="new-password"
                  className={`input-field pr-12 ${errors.confirmPassword ? "error" : ""}`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm(p => !p)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white text-xs font-bold uppercase transition-colors"
                >
                  {showConfirm ? "HIDE" : "SHOW"}
                </button>
              </div>
              {form.confirmPassword && form.password === form.confirmPassword && (
                <p className="text-[#c8f135] text-xs mt-1.5 font-bold">✓ Passwords match</p>
              )}
              {errors.confirmPassword && <p className="text-red-400 text-xs mt-1.5">⚠ {errors.confirmPassword}</p>}
            </div>

            {/* Terms note */}
            <p className="text-white/30 text-xs leading-relaxed">
              By creating an account, you agree to our{" "}
              <span className="text-[#FF4500] underline cursor-pointer">Terms of Service</span> and{" "}
              <span className="text-[#FF4500] underline cursor-pointer">Privacy Policy</span>.
            </p>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading || success}
              className="w-full bg-[#FF4500] hover:bg-[#e03d00] disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold uppercase tracking-widest text-sm py-4 transition-all flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <>
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" strokeDasharray="30" strokeDashoffset="10" />
                  </svg>
                  Creating Account...
                </>
              ) : "Create Account ↗"}
            </button>
          </form>

          {/* Sign In link */}
          <p className="text-center text-white/40 text-sm mt-8">
            Already have an account?{" "}
            <button onClick={() => navigate("/signin")} className="text-[#FF4500] font-bold hover:underline transition-all">
              Sign In →
            </button>
          </p>

          {/* Back to home */}
          <button
            onClick={() => navigate("/landing")}
            className="mt-4 w-full text-center text-white/20 hover:text-white/50 text-xs transition-colors"
          >
            ← Back to Home
          </button>
        </div>
      </div>
    </div>
  );
}