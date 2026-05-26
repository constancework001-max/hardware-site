const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendLoginEmail = async (to, name) => {
  await transporter.sendMail({
    from: `"TechFixPro" <${process.env.EMAIL_USER}>`,
    to,
    subject: "Login Successful",
    html: `
      <h2>Hello ${name},</h2>
      <p>Thanks for logging in to TechFixPro.</p>
      <p>We're happy to have you back! 🚀</p>
    `
  });
};

module.exports = { sendLoginEmail };