import { useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom"; // Added for structural routing

export default function LandingPage() { // Removed navigate from props
  const navigate = useNavigate(); // Initialize the hook
  const tickerRef = useRef(null);

  useEffect(() => {
    const ticker = tickerRef.current;
    if (!ticker) return;
    let x = 0;
    const speed = 0.5;
    const step = () => {
      x -= speed;
      if (x <= -ticker.scrollWidth / 2) x = 0;
      ticker.style.transform = `translateX(${x}px)`;
      requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-['Space_Grotesk',sans-serif] overflow-x-hidden">
      {/* Google Font */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Bebas+Neue&display=swap');
        .font-bebas { font-family: 'Bebas Neue', cursive; }
        .font-grotesk { font-family: 'Space Grotesk', sans-serif; }
        @keyframes fadeUp { from { opacity:0; transform:translateY(30px); } to { opacity:1; transform:translateY(0); } }
        .fade-up { animation: fadeUp 0.7s ease forwards; }
        .fade-up-2 { animation: fadeUp 0.7s 0.15s ease both; }
        .fade-up-3 { animation: fadeUp 0.7s 0.3s ease both; }
        .fade-up-4 { animation: fadeUp 0.7s 0.45s ease both; }
        @keyframes pulse-glow { 0%,100% { box-shadow: 0 0 0 0 rgba(255,69,0,0.4); } 50% { box-shadow: 0 0 0 12px rgba(255,69,0,0); } }
        .btn-glow:hover { animation: pulse-glow 1.2s infinite; }
      `}</style>

      {/* NAV */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 border-b border-white/10">
        <span className="font-bebas text-3xl tracking-widest text-[#FF4500]">DEV<span className="text-white">SYNC</span></span>
        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-white/70">
          <a href="#" className="hover:text-white transition-colors">About</a>
          <a href="#" className="hover:text-white transition-colors">Features</a>
          <a href="#" className="hover:text-white transition-colors">Work</a>
          <a href="#" className="hover:text-white transition-colors">Contact</a>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate("/signin")} className="text-sm font-medium text-white/70 hover:text-white transition-colors px-4 py-2">
            Sign In
          </button>
          <button
            onClick={() => navigate("/signup")}
            className="btn-glow text-sm font-bold bg-[#FF4500] hover:bg-[#e03d00] text-white px-5 py-2.5 rounded-none transition-colors uppercase tracking-wider"
          >
            Get Started ↗
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="px-6 md:px-12 pt-16 pb-12 md:pt-24 md:pb-20 max-w-6xl mx-auto">
        <div className="fade-up">
          <span className="inline-block text-[#FF4500] text-xs font-bold uppercase tracking-[0.3em] mb-4 border border-[#FF4500]/30 px-3 py-1">
            ● Live Collaboration Platform
          </span>
        </div>
        <h1 className="font-bebas text-[clamp(4rem,12vw,9rem)] leading-[0.95] tracking-wide fade-up-2">
          HOOKED BY{" "}
          <span className="text-[#FF4500] relative">
            VISUALS
            <span className="absolute -bottom-2 left-0 w-full h-1 bg-[#FF4500]"></span>
          </span>
          ,<br />
          FASCINATED BY{" "}
          <span className="bg-[#FF4500] text-white px-2">SYNC</span>
          ,<br />
          FUELLED BY{" "}
          <span className="text-[#c8f135]">CRAFTSMANSHIP</span>
          <br />
          AND{" "}
          <span className="text-[#c8f135]">MEANINGFUL</span>{" "}
          <span className="text-white/20 line-through">CHAOS</span>{" "}
          <span className="text-white">AESTHETICS.</span>
        </h1>

        <div className="mt-10 flex flex-col md:flex-row items-start md:items-center gap-6 fade-up-3">
          <button
            onClick={() => navigate("/signup")}
            className="btn-glow bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold uppercase tracking-widest text-sm px-8 py-4 rounded-none transition-all flex items-center gap-2"
          >
            Start Building ↗
          </button>
          <button
            onClick={() => navigate("/signin")}
            className="text-white/60 hover:text-white font-medium text-sm underline underline-offset-4 transition-colors"
          >
            Already synced? Sign In →
          </button>
        </div>

        <div className="mt-12 flex items-center gap-8 fade-up-4">
          <div>
            <p className="font-bebas text-4xl text-[#FF4500]">12K+</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Devs Synced</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div>
            <p className="font-bebas text-4xl text-white">98%</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Uptime</p>
          </div>
          <div className="w-px h-10 bg-white/20"></div>
          <div>
            <p className="font-bebas text-4xl text-[#c8f135]">4.9★</p>
            <p className="text-xs text-white/50 uppercase tracking-wider">Rated</p>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="overflow-hidden bg-[#FF4500] py-3 my-4 rotate-[-1deg] scale-105">
        <div ref={tickerRef} className="flex gap-0 whitespace-nowrap">
          {Array(4).fill("● REAL-TIME COLLABORATION ● VERSION CONTROL ● CODE REVIEW ● TEAM SYNC ● DEPLOY ANYWHERE ● OPEN SOURCE ").map((t, i) => (
            <span key={i} className="font-bebas text-xl text-white tracking-widest px-4">{t}</span>
          ))}
        </div>
      </div>

      {/* FEATURES */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="mb-12">
          <p className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.3em] mb-3">— What We Do</p>
          <h2 className="font-bebas text-6xl md:text-8xl leading-none">
            DEEP INTO BRAND<br />
            <span className="text-white/30">EXPERIENCE,</span> WEB PRESENCE<br />
            AND DIGITAL PRODUCTS
          </h2>
        </div>

        <div className="mt-12 border-t border-white/10">
          {[
            { title: "REAL-TIME CODE SYNC", tags: ["WebSockets", "OT Algorithms", "Conflict-free"], desc: "Collaborate on code as if you're in the same room." },
            { title: "SMART REVIEW SYSTEM", tags: ["PR Review", "Inline Comments", "AI Assist"], desc: "Streamlined pull-request workflows built for speed." },
            { title: "DEPLOYMENT PIPELINES", tags: ["CI/CD", "Docker", "Multi-cloud"], desc: "From commit to production in minutes, not hours." },
            { title: "TEAM ANALYTICS", tags: ["Velocity", "Burndown", "Insights"], desc: "Data-driven decisions to keep teams performing." },
          ].map((item, i) => (
            <div key={i} className="flex flex-col md:flex-row md:items-center justify-between py-6 border-b border-white/10 group cursor-pointer hover:pl-4 transition-all duration-300">
              <div className="flex items-center gap-4">
                <span className="font-bebas text-2xl md:text-4xl group-hover:text-[#FF4500] transition-colors">{item.title}</span>
                <div className="flex gap-2 flex-wrap">
                  {item.tags.map(t => (
                    <span key={t} className="text-[10px] font-bold uppercase tracking-wider bg-white/10 px-2 py-0.5 rounded-sm text-white/60">{t}</span>
                  ))}
                </div>
              </div>
              <div className="flex items-center gap-4 mt-2 md:mt-0">
                <p className="text-sm text-white/50 max-w-xs hidden md:block">{item.desc}</p>
                <span className="text-[#FF4500] text-xl font-bold">+</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* MARQUEE 2 */}
      <div className="overflow-hidden bg-[#1a1a1a] border-y border-white/10 py-3 my-4">
        <div className="flex gap-0 whitespace-nowrap animate-none">
          <span className="font-bebas text-lg text-white/30 tracking-widest">
            {Array(3).fill("● SERIOUS. GIVE A DAMN. SWEAT THE DELIVERY. DO BRAGWORTHY WORK. GO AT IT WITH ALL YOUR HEART. FORM FOLLOWS FUNCTION. GIVE A DAMN. ").join("")}
          </span>
        </div>
      </div>

      {/* TESTIMONIALS */}
      <section className="px-6 md:px-12 py-20 max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <span className="text-5xl text-[#FF4500] font-bebas">"</span>
          <h2 className="font-bebas text-5xl md:text-7xl">KIND WORDS, BIG EGO BOOST</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          {[
            { name: "Siddhi Dixit", role: "Frontend Lead, Zudol", text: "DevSync completely transformed how our team collaborates. The real-time sync is absolutely flawless.", color: "#c8f135" },
            { name: "Anuj Mehra", role: "Product Manager, Kissflow", text: "Outstanding attention to detail. The review system alone is worth switching for every engineering team.", color: "#FF4500" },
            { name: "Divyan Singhavi", role: "CTO, TripleDart", text: "Professional, creative, and detail-oriented. We shipped 3x faster after integrating DevSync into our workflow.", color: "#ffffff" },
          ].map((t, i) => (
            <div key={i} className="bg-[#111] border border-white/10 p-6 hover:border-[#FF4500]/50 transition-colors">
              <p className="text-white/70 text-sm leading-relaxed mb-6">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs" style={{ background: t.color + "22", color: t.color, border: `1px solid ${t.color}44` }}>
                  {t.name.split(" ").map(n => n[0]).join("")}
                </div>
                <div>
                  <p className="font-bold text-sm" style={{ color: t.color }}>{t.name}</p>
                  <p className="text-white/40 text-xs">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="px-6 md:px-12 py-24 text-center border-t border-white/10 max-w-4xl mx-auto">
        <p className="text-[#FF4500] text-xs font-bold uppercase tracking-[0.3em] mb-4">— Let's Build Together</p>
        <h2 className="font-bebas text-6xl md:text-9xl leading-none mb-8">
          LET'S MAKE<br />
          <span className="text-[#FF4500]">SOMETHING GREAT!</span><br />
          GET IN TOUCH ↗
        </h2>
        <p className="text-white/50 text-sm mb-8 max-w-md mx-auto">
          We're always open to new opportunities, collaborations, and connections. Whether you have a project you'd like to discuss or just want to say hi — feel free to reach out.
        </p>
        <button
          onClick={() => navigate("/signup")}
          className="btn-glow bg-[#FF4500] hover:bg-[#e03d00] text-white font-bold uppercase tracking-widest text-sm px-10 py-5 rounded-none transition-all inline-flex items-center gap-2"
        >
          Create Free Account ↗
        </button>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#FF4500] px-6 md:px-12 py-8">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <span className="font-bebas text-3xl tracking-widest text-white">DEV<span className="text-black">SYNC</span></span>
          <p className="text-white/80 text-xs">© 2025 DevSync — All Rights Reserved</p>
          <div className="flex items-center gap-4 text-white/80 text-xs font-medium">
            <span>Privacy</span>
            <span>Terms</span>
            <button onClick={() => navigate("/signup")} className="bg-black text-white px-4 py-2 text-xs font-bold uppercase tracking-wider hover:bg-white hover:text-black transition-colors">
              GET IN TOUCH ↗
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}