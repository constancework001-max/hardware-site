import { useState, useRef } from "react";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [toast, setToast] = useState("");

  const inputsRef = useRef([]);

  // ================= TOAST =================
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // ================= SEND OTP =================
  const sendOtp = async () => {
    if (!email) return showToast("Enter email first");

    try {
      const res = await api.post("/auth/send-otp", { email });
      showToast(res.data.message || "OTP sent");
    } catch (err) {
      console.error(err);
      showToast("Failed to send OTP");
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    const finalOtp = otp.join("");

    try {
      const res = await api.post("/auth/login", {
        email,
        password,
        otp: finalOtp
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";

    } catch (err) {
      console.error(err);
      showToast("Login failed");
    }
  };

  // ================= OTP INPUT =================
  const handleOtpChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }

    if (!value && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center text-white">

      {/* TOAST */}
      {toast && (
        <div className="fixed top-5 right-5 bg-red-500 px-4 py-2 rounded shadow-lg z-50 animate-fadeIn">
          {toast}
        </div>
      )}

      {/* HEADER */}
      <div className="text-center mb-8 animate-fadeIn">
        <h1 className="text-4xl font-bold mb-2 tracking-wide">
          Login
        </h1>
        <p className="text-gray-400">
          Welcome back to TechFix Pro
        </p>
      </div>

      {/* CARD */}
      <div className="w-full max-w-md p-8 rounded-2xl 
bg-[#0f0f0f]/80 backdrop-blur-xl
border border-gray-800 
shadow-[0_0_40px_rgba(255,255,255,0.03)]
animate-card">
        {/* EMAIL */}
        <input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
         className="w-full mb-5 p-4 rounded-xl 
bg-[#141414] 
border border-gray-700 
focus:border-orange-500 
focus:ring-1 focus:ring-orange-500 
outline-none transition duration-300"
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full mb-5 p-4 rounded-xl 
bg-[#141414] 
border border-gray-700 
focus:border-orange-500 
focus:ring-1 focus:ring-orange-500 
outline-none transition duration-300"
        />

        {/* OTP */}
        <div className="flex justify-between mb-5">
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              maxLength="1"
             className="w-12 h-14 text-center text-lg 
bg-[#141414] 
border border-gray-700 
rounded-xl 
focus:border-orange-500 
focus:ring-1 focus:ring-orange-500 
outline-none transition"
            />
          ))}
        </div>

        {/* SEND OTP */}
        <button
          onClick={sendOtp}
          className="w-full border border-orange-500 text-orange-500 py-3 rounded-xl mb-3 hover:bg-orange-500 hover:text-white transition duration-300"
        >
          Send OTP
        </button>

        {/* LOGIN */}
        <button
          onClick={handleLogin}
          className="w-full bg-gradient-to-r from-orange-500 to-orange-600 
py-3 rounded-xl font-semibold 
hover:scale-[1.02] hover:shadow-lg 
transition duration-300"
        >
          Login
        </button>

        <p className="text-center text-gray-400 mt-5">
          Don’t have an account?{" "}
          <span className="text-orange-500 cursor-pointer">
            Sign up
          </span>
        </p>

      </div>
    </div>
  );
}