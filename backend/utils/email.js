const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

const sendBookingEmail = async (user, service, booking) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
      <div style="background: #111827; padding: 24px; text-align: center;">
        <h1 style="color: #f97316; margin: 0; font-size: 24px;">⚙️ TechFix Pro</h1>
        <p style="color: #9ca3af; margin: 8px 0 0;">Hardware Sales & Repairs</p>
      </div>
      <div style="padding: 32px;">
        <h2 style="color: #111827;">Booking Confirmed! ✅</h2>
        <p style="color: #374151;">Hi ${user.name}, your service booking has been received.</p>
        <div style="background: #f9fafb; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px 0; color: #6b7280;">Booking ID</td><td style="font-weight: 600; color: #111827;">#${booking.id}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Service</td><td style="font-weight: 600; color: #111827;">${service.name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Device</td><td style="font-weight: 600; color: #111827;">${booking.device_name}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Date</td><td style="font-weight: 600; color: #111827;">${booking.booking_date}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Time</td><td style="font-weight: 600; color: #111827;">${booking.booking_time}</td></tr>
            <tr><td style="padding: 8px 0; color: #6b7280;">Price</td><td style="font-weight: 600; color: #f97316;">₹${booking.total_price}</td></tr>
          </table>
        </div>
        <p style="color: #374151;">We'll contact you shortly to confirm the appointment. You can also track your booking in your dashboard.</p>
        <p style="color: #6b7280; font-size: 14px; margin-top: 24px;">Questions? Reply to this email or call us.</p>
      </div>
      <div style="background: #f3f4f6; padding: 16px; text-align: center;">
        <p style="color: #9ca3af; font-size: 12px; margin: 0;">© 2025 TechFix Pro. All rights reserved.</p>
      </div>
    </div>
  `;

  await transporter.sendMail({
    from: `"TechFix Pro" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: `Booking Confirmed - #${booking.id} | ${service.name}`,
    html
  });
};

module.exports = { sendBookingEmail };
