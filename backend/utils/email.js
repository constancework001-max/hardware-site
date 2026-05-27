const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ================= SEND OTP EMAIL =================
const sendOTPEmail = async (to, otp) => {
  await transporter.sendMail({
    from: `"TechFix Pro" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code - TechFix Pro",
    html: `
      <div style="font-family: Arial; text-align:center;">
        <h2>TechFix Pro Login OTP</h2>
        <p>Your OTP code is:</p>
        <h1 style="color:#f97316;">${otp}</h1>
        <p>This OTP is valid for 5 minutes.</p>
      </div>
    `
  });
};

module.exports = { sendOTPEmail };