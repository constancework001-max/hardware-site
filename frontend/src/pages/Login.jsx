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

  // ================= UI =================
  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>

      <h2>Login</h2>

      <input
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <br /><br />

      {!showOTP && (
        <>
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br /><br />

          <button onClick={handleLogin}>Login</button>

          <br /><br />

          <button onClick={sendOtp}>
            Login with OTP
          </button>
        </>
      )}

      {showOTP && (
        <>
          <h3>Enter OTP</h3>

          <div style={{ display: "flex", justifyContent: "center", gap: "10px" }}>
            {otp.map((digit, index) => (
              <input
                key={index}
                ref={(el) => (inputsRef.current[index] = el)}
                value={digit}
                onChange={(e) => handleOtpChange(e.target.value, index)}
                maxLength="1"
                style={{
                  width: "40px",
                  height: "40px",
                  textAlign: "center"
                }}
              />
            ))}
          </div>

          <br />

          <button onClick={verifyOtp}>Verify OTP</button>
        </>
      )}
    </div>
  );
}