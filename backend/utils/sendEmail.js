// utils/sendEmail.js – Nodemailer transporter wrapper
const nodemailer = require('nodemailer');

/**
 * Send an email via Nodemailer (Gmail SMTP by default).
 * @param {object} options
 * @param {string} options.to - Recipient email address
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML body content
 */
const sendEmail = async ({ to, subject, html }) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: parseInt(process.env.EMAIL_PORT || '587', 10),
    secure: false, // STARTTLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"Ekthaa ✦" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

/**
 * Build a luxury-branded OTP email template.
 */
const buildOtpEmail = (otp, purpose = 'verification') => `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <style>
    body { margin:0; padding:0; background:#FAF6F2; font-family:'Inter',sans-serif; }
    .wrapper { max-width:480px; margin:40px auto; background:#FFFDFC;
               border:1px solid #E5D8CF; border-radius:24px; overflow:hidden; }
    .header { background:linear-gradient(135deg,#AA8472,#DDC3B7);
              padding:32px 40px; text-align:center; }
    .header h1 { margin:0; color:#fff; font-size:28px; font-weight:700; letter-spacing:-0.02em; }
    .header p  { margin:6px 0 0; color:rgba(255,255,255,0.80); font-size:14px; }
    .body { padding:40px; }
    .otp-box { background:#F4EDE6; border:1px solid #E5D8CF; border-radius:16px;
               text-align:center; padding:28px 20px; margin:24px 0; }
    .otp { font-size:42px; font-weight:800; letter-spacing:12px; color:#AA8472; }
    .note { font-size:13px; color:#A28D80; margin-top:10px; }
    .footer { text-align:center; padding:20px 40px; font-size:12px; color:#A28D80;
              border-top:1px solid #E5D8CF; }
  </style>
</head>
<body>
  <div class="wrapper">
    <div class="header">
      <h1>✦ Ekthaa</h1>
      <p>Your ${purpose} code</p>
    </div>
    <div class="body">
      <p style="color:#4A3B33;font-size:15px;line-height:1.7">
        Here is your one-time verification code. It expires in <strong>5 minutes</strong>.
      </p>
      <div class="otp-box">
        <div class="otp">${otp}</div>
        <div class="note">Do not share this code with anyone.</div>
      </div>
      <p style="color:#7B6557;font-size:13px;line-height:1.7">
        If you didn't request this, you can safely ignore this email.
      </p>
    </div>
    <div class="footer">© ${new Date().getFullYear()} Ekthaa · Ideas worth reading</div>
  </div>
</body>
</html>
`;

module.exports = { sendEmail, buildOtpEmail };
