const nodemailer = require("nodemailer");

// ✅ FIXED TRANSPORT (IMPORTANT)
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true, // MUST be true
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// SEND OTP EMAIL
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