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
    <div style={container}>

      {/* TOAST */}
      {toast && (
        <div style={toastStyle}>
          {toast}
        </div>
      )}

      <div style={card}>

        <h2 style={{ color: "#fff" }}>Login</h2>

        {/* EMAIL */}
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={input}
        />

        {/* PASSWORD */}
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={input}
        />

        {/* OTP */}
        <div style={otpContainer}>
          {otp.map((digit, index) => (
            <input
              key={index}
              ref={(el) => (inputsRef.current[index] = el)}
              value={digit}
              onChange={(e) => handleOtpChange(e.target.value, index)}
              maxLength="1"
              style={otpBox}
            />
          ))}
        </div>

        {/* SEND OTP */}
        <button style={outlineBtn} onClick={sendOtp} disabled={loading}>
          {loading ? "Sending..." : "Send OTP"}
        </button>

        {/* LOGIN */}
        <button style={btn} onClick={handleLogin} disabled={loading}>
          {loading ? "Please wait..." : "Login"}
        </button>

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