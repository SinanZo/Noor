const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT || 587),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendDonationReceipt(opts) {
  const { to, name, amountCents, currency, projectTitleEn, projectTitleAr, paymentId } = opts;
  
  const amount = (amountCents / 100).toFixed(2) + ' ' + currency.toUpperCase();
  const subject = `Donation Receipt — ${amount}`;
  
  const html = `
    <div style="font-family:system-ui,-apple-system,Segoe UI,Roboto;padding:20px">
      <h2 style="color:#009688">جزاك الله خيرًا / JazakAllahu Khairan</h2>
      <p>Dear ${name || 'Donor'},</p>
      <p>We have received your generous donation:</p>
      <table style="margin:20px 0">
        <tr><td><strong>Amount:</strong></td><td>${amount}</td></tr>
        <tr><td><strong>Project:</strong></td><td>${projectTitleEn || ''} — ${projectTitleAr || ''}</td></tr>
        <tr><td><strong>Payment ID:</strong></td><td>${paymentId}</td></tr>
      </table>
      <p>May Allah accept your charity and reward you abundantly.</p>
      <p style="margin-top:30px">— Noor SuperApp Team</p>
    </div>
  `;
  
  await transporter.sendMail({
    from: process.env.EMAIL_FROM,
    to,
    subject,
    html,
  });
}

module.exports = { transporter, sendDonationReceipt };
