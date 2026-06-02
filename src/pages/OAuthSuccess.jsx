import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

export default function OAuthSuccess() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const token = searchParams.get("token");

    if (token) {
      try {
        const decoded = jwtDecode(token);
        localStorage.setItem("token", token);
        localStorage.setItem(
          "user",
          JSON.stringify({
            userId: decoded.userId || decoded.id,
            username: decoded.username,
            email: decoded.sub,
          })
        );
        navigate("/dashboard");
      } catch (error) {
        console.error("Failed to decode incoming OAuth token:", error);
        navigate("/signin");
      }
    } else {
      navigate("/signin");
    }
  }, [searchParams, navigate]);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center font-['Space_Grotesk',sans-serif]">
      <div className="text-center">
        {/* Sleek, animated loader matching your design style */}
        <div className="animate-spin w-8 h-8 border-4 border-[#FF4500] border-t-transparent rounded-full mx-auto mb-4"></div>
        <p className="text-white/60 text-sm tracking-wide font-bold uppercase">
          Securing your session...
        </p>
      </div>
    </div>
  );
}