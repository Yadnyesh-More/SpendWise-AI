import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({  // ← createTransport() not createTransporter
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (email, otp) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'SpendWise - Your OTP Code',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Your OTP Code</h2>
        <div style="background: #4F46E5; color: white; font-size: 32px; font-weight: bold; padding: 20px; text-align: center; border-radius: 8px; letter-spacing: 5px;">
          ${otp}
        </div>
        <p style="color: #6B7280; margin-top: 20px;">
          This code expires in 5 minutes. Do not share with anyone.
        </p>
      </div>
    `
  };
  
  await transporter.sendMail(mailOptions);
};
