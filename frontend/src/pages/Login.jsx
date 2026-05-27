import { useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import toast from 'react-hot-toast';

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [otp, setOtp] = useState(new Array(6).fill(''));
  const [loading, setLoading] = useState(false);

  const inputsRef = useRef([]);

  // ================= SEND OTP =================
 const handleSendOTP = async () => {
  if (!email) {
    toast.error("Enter email first");
    return;
  }

  const toastId = toast.loading("Sending OTP... ⏳");

  try {
    await api.post('/auth/send-otp', { email });

    toast.success("OTP sent to your email 📩", {
      id: toastId
    });

  } catch (err) {
    toast.error(err.response?.data?.message || "Failed to send OTP", {
      id: toastId
    });
  }
};

  // ================= LOGIN =================
 const handleLogin = async (e) => {
  e.preventDefault();

  const otpCode = otp.join('');

  if (otpCode.length !== 6) {
    toast.error("Enter complete OTP");
    return;
  }

  const toastId = toast.loading("Logging in... 🔐");

  try {
    const res = await api.post('/auth/login', {
      email,
      password,
      otp: otpCode
    });

    localStorage.setItem("token", res.data.token);
    localStorage.setItem("user", JSON.stringify(res.data.user));

    toast.success("Login successful 🎉", { id: toastId });

    navigate('/dashboard');

  } catch (err) {
    toast.error(err.response?.data?.message || "Login failed", {
      id: toastId
    });
  }
};

  // ================= OTP INPUT =================
  const handleOTPChange = (value, index) => {
    if (!/^[0-9]?$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    // move forward
    if (value && index < 5) {
      inputsRef.current[index + 1].focus();
    }
  };

  // handle backspace
  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputsRef.current[index - 1].focus();
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4 py-16">
      <div className="w-full max-w-md fade-up">

        {/* HEADER */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Login</h1>
          <p className="text-white/50">Welcome back to TechFix Pro</p>
        </div>

        {/* CARD */}
        <form onSubmit={handleLogin} className="card p-8 space-y-5 animate-card">

          {/* EMAIL */}
          <div>
            <label className="label">Email address</label>
            <input
              type="email"
              className="input"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* PASSWORD */}
          <div>
            <label className="label">Password</label>
            <input
              type="password"
              className="input"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* OTP */}
          <div>
            <label className="label">OTP</label>
            <div className="flex justify-between gap-2">
              {otp.map((digit, index) => (
                <input
                  key={index}
                  ref={(el) => (inputsRef.current[index] = el)}
                  type="text"
                  maxLength="1"
                  value={digit}
                  onChange={(e) => handleOTPChange(e.target.value, index)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className="w-12 h-14 text-center text-lg input"
                />
              ))}
            </div>
          </div>

          {/* SEND OTP */}
          <button
            type="button"
            onClick={handleSendOTP}
            disabled={loading}
            className="btn-secondary w-full py-3"
          >
            {loading ? "Sending..." : "Send OTP"}
          </button>

          {/* LOGIN */}
          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full py-3.5"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          {/* FOOTER */}
          <p className="text-center text-white/50 text-sm">
            Don’t have an account?{' '}
            <Link to="/register" className="text-brand-500 hover:text-brand-400 font-medium">
              Sign up
            </Link>
          </p>

        </form>
      </div>
    </div>
  );
}