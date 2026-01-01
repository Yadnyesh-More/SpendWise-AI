import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  pool: true, // Reuse connections for speed
  maxConnections: 1,
  maxMessages: 10
});

export const sendEmail = async (email, otp) => {
  const mailOptions = {
    from: `"SpendWise AI" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: 'Your OTP - Expires in 5min',
    html: `
      <div style="font-family: -apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:400px;margin:50px auto;padding:20px;background:#f8fafc;border-radius:12px;box-shadow:0 10px 25px rgba(0,0,0,0.1);">
        <h2 style="color:#4f46e5;font-size:24px;margin:0 0 20px;">Your OTP Code</h2>
        <div style="background:linear-gradient(135deg,#4f46e5,#7c3aed);color:white;font-size:36px;font-weight:700;padding:24px;text-align:center;border-radius:12px;letter-spacing:8px;margin:0 0 20px;box-shadow:0 8px 20px rgba(79,70,229,0.3);">
          ${otp}
        </div>
        <p style="color:#64748b;font-size:14px;line-height:1.5;margin:0;">Valid for 5 minutes only. Never share your OTP.</p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
