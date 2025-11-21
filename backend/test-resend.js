require('dotenv').config();
const { Resend } = require('resend');

async function testResend() {
  console.log('Testing Resend configuration...');
  console.log('RESEND_API_KEY:', process.env.RESEND_API_KEY ? 'Set' : 'Not set');
  console.log('EMAIL_FROM:', process.env.EMAIL_FROM);

  if (!process.env.RESEND_API_KEY) {
    console.error('❌ RESEND_API_KEY not found in environment variables');
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: ['test@example.com'], // Replace with your test email
      subject: 'VibeCircle - Test Email',
      html: '<h1>Test Email from VibeCircle</h1><p>This is a test email using Resend.</p>'
    });

    if (error) {
      console.error('❌ Resend error:', error);
    } else {
      console.log('✅ Test email sent successfully:', data);
    }
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

testResend();