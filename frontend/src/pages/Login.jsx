import { useState, useRef } from "react";
import api from "../api/axios";
console.log("OTP VERSION 2");
export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [showOTP, setShowOTP] = useState(false);
  const [otp, setOtp] = useState(new Array(6).fill(""));

  const inputsRef = useRef([]);

  // ================= NORMAL LOGIN =================
  const handleLogin = async () => {
    try {
      const res = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";
    } catch (err) {
      alert("Login failed");
    }
  };

  // ================= SEND OTP =================
  const sendOtp = async () => {
    try {
      await api.post("/auth/send-otp", { email });
      alert("OTP sent to your email");
      setShowOTP(true);
    } catch {
      alert("Failed to send OTP");
    }
  };

  // ================= VERIFY OTP =================
  const verifyOtp = async () => {
    try {
      const finalOtp = otp.join("");

      const res = await api.post("/auth/verify-otp", {
        email,
        otp: finalOtp
      });

      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      window.location.href = "/dashboard";
    } catch {
      alert("Invalid OTP");
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

  const inputStyle = {
  width: "100%",
  padding: "10px",
  marginBottom: "15px",
  borderRadius: "6px",
  border: "1px solid #333",
  backgroundColor: "#000",
  color: "#fff"
};

const btnStyle = {
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
  backgroundColor: "transparent",
  border: "1px solid #ff6a00",
  borderRadius: "6px",
  color: "#ff6a00",
  cursor: "pointer"
};

  // ================= UI =================
 return (
  <div style={{
    minHeight: "100vh",
    backgroundColor: "#0b0b0b",
    display: "flex",
    justifyContent: "center",
    alignItems: "center"
  }}>

    <div style={{
      backgroundColor: "#111",
      padding: "40px",
      borderRadius: "12px",
      width: "350px",
      textAlign: "center",
      boxShadow: "0 0 20px rgba(0,0,0,0.5)"
    }}>

      <h2 style={{ color: "#fff", marginBottom: "20px" }}>
        Login
      </h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={inputStyle}
      />

      {!showOTP && (
        <>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={inputStyle}
          />

          <button style={btnStyle} onClick={handleLogin}>
            Login
          </button>

          <p style={{ color: "#aaa", margin: "10px 0" }}>
            OR
          </p>

          <button style={outlineBtn} onClick={sendOtp}>
            Login with OTP
          </button>
        </>
      )}

      {showOTP && (
        <>
          <p style={{ color: "#aaa" }}>Enter OTP</p>

          <div style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "15px"
          }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                maxLength="1"
                style={{
                  width: "40px",
                  height: "45px",
                  textAlign: "center",
                  fontSize: "18px",
                  borderRadius: "6px",
                  border: "1px solid #333",
                  backgroundColor: "#000",
                  color: "#fff"
                }}
              />
            ))}
          </div>

          <button style={btnStyle} onClick={verifyOtp}>
            Verify OTP
          </button>
        </>
      )}
    </div>
  </div>
);
}