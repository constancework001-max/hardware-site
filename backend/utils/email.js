const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

// ✅ OTP EMAIL
const sendOTPEmail = async (to, otp) => {
  return transporter.sendMail({
    from: `"TechFixPro" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Your OTP Code",
    html: `
      <h2>Your OTP Code</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This expires in 5 minutes.</p>
    `
  });
};

// ✅ LOGIN SUCCESS EMAIL
const sendLoginEmail = async (to, name) => {
  return transporter.sendMail({
    from: `"TechFixPro" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Welcome to TechFixPro 🚀",
    html: `
      <h2>Hello ${name},</h2>
      <p>You have successfully logged in.</p>
      <p>Enjoy our services!</p>
    `
  });
};

module.exports = { sendOTPEmail, sendLoginEmail };