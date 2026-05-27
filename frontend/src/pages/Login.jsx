import { useState, useRef } from "react";
import api from "../api/axios";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [loading, setLoading] = useState(false);
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
      setLoading(true);
      await api.post("/auth/send-otp", { email });
      showToast("OTP sent to email");
    } catch {
      showToast("Failed to send OTP");
    } finally {
      setLoading(false);
    }
  };

  // ================= LOGIN =================
  const handleLogin = async () => {
    const finalOtp = otp.join("");

    try {
      setLoading(true);

      const res = await api.post("/auth/login", {
        email,
        password,
        otp: finalOtp
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";

    } catch {
      showToast("Login failed");
    } finally {
      setLoading(false);
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
  };

 return (
  <div className="min-h-screen flex items-center justify-center bg-black text-white">

    {/* TOAST */}
    {toast && (
      <div className="fixed top-5 right-5 bg-red-500 px-4 py-2 rounded shadow-lg z-50">
        {toast}
      </div>
    )}

    <div className="w-full max-w-md bg-[#111] rounded-xl p-8 shadow-xl">

      <h2 className="text-3xl font-bold text-center mb-2">
        Login
      </h2>

      <p className="text-center text-gray-400 mb-6">
        Welcome back to TechFix Pro
      </p>

      {/* EMAIL */}
      <input
        type="email"
        placeholder="Email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full mb-4 p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 outline-none"
      />

      {/* PASSWORD */}
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full mb-4 p-3 rounded-lg bg-[#1a1a1a] border border-gray-700 outline-none"
      />

      {/* OTP BOXES */}
      <div className="flex justify-between mb-4">
        {otp.map((digit, index) => (
          <input
            key={index}
            ref={(el) => (inputsRef.current[index] = el)}
            value={digit}
            onChange={(e) => handleOtpChange(e.target.value, index)}
            maxLength="1"
            className="w-10 h-12 text-center text-lg bg-black border border-gray-700 rounded"
          />
        ))}
      </div>

      {/* SEND OTP */}
      <button
        onClick={sendOtp}
        className="w-full border border-orange-500 text-orange-500 py-3 rounded-lg mb-3 hover:bg-orange-500 hover:text-white transition"
      >
        Send OTP
      </button>

      {/* LOGIN */}
      <button
        onClick={handleLogin}
        className="w-full bg-orange-500 py-3 rounded-lg font-semibold hover:bg-orange-600 transition"
      >
        Login
      </button>

      <p className="text-center text-gray-400 mt-5">
        Don’t have an account? <span className="text-orange-500 cursor-pointer">Sign up</span>
      </p>

    </div>
  </div>
);
}

// ================= STYLES =================
const container = {
  minHeight: "100vh",
  backgroundColor: "#0b0b0b",
  display: "flex",
  justifyContent: "center",
  alignItems: "center"
};

const card = {
  backgroundColor: "#111",
  padding: "40px",
  borderRadius: "12px",
  width: "350px",
  textAlign: "center",
  boxShadow: "0 0 20px rgba(0,0,0,0.5)"
};

const input = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #333",
  backgroundColor: "#000",
  color: "#fff"
};

const otpContainer = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "15px"
};

const otpBox = {
  width: "40px",
  height: "45px",
  textAlign: "center",
  fontSize: "18px",
  borderRadius: "6px",
  border: "1px solid #333",
  backgroundColor: "#000",
  color: "#fff"
};

const btn = {
  width: "100%",
  padding: "10px",
  backgroundColor: "#ff6a00",
  border: "none",
  borderRadius: "6px",
  color: "#fff",
  cursor: "pointer",
  fontWeight: "bold"
};

const outlineBtn = {
  width: "100%",
  padding: "10px",
  marginBottom: "10px",
  backgroundColor: "transparent",
  border: "1px solid #ff6a00",
  borderRadius: "6px",
  color: "#ff6a00",
  cursor: "pointer"
};

const toastStyle = {
  position: "absolute",
  top: "20px",
  right: "20px",
  backgroundColor: "#ff4d4d",
  color: "#fff",
  padding: "10px 15px",
  borderRadius: "6px",
  boxShadow: "0 0 10px rgba(0,0,0,0.3)"
};