const nodemailer = require("nodemailer");

// ✅ USE PORT 587 (IMPORTANT FIX)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // MUST be false for 587
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

const sendOTPEmail = async (to, otp) => {
  try {
    console.log("📨 Sending OTP to:", to);

    const info = await transporter.sendMail({
      from: `"TechFix Pro" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Your OTP Code",
      html: `
        <h2>TechFix Pro Login</h2>
        <p>Your OTP is:</p>
        <h1>${otp}</h1>
        <p>This OTP will expire in 5 minutes.</p>
      `
    });

    console.log("✅ OTP Email sent:", info.response);

  } catch (err) {
    console.error("❌ FULL EMAIL ERROR:", err);
    throw err;
  }
};

module.exports = { sendOTPEmail };