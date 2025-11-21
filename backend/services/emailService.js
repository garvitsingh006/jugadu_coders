const { Resend } = require('resend');

class EmailService {
  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendOTP(email, otp, name) {
    const emailData = {
      from: process.env.EMAIL_FROM,
      to: [email],
      subject: 'VibeCircle - Verify Your Email',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #0ea5e9; margin: 0;">VibeCircle</h1>
            <p style="color: #64748b; margin: 5px 0;">AI-Powered Social Platform</p>
          </div>
          
          <div style="background: linear-gradient(135deg, #0ea5e9 0%, #d946ef 100%); padding: 30px; border-radius: 15px; text-align: center; margin-bottom: 30px;">
            <h2 style="color: white; margin: 0 0 15px 0;">Welcome ${name}! 🎉</h2>
            <p style="color: white; margin: 0; opacity: 0.9;">Please verify your email to complete registration</p>
          </div>
          
          <div style="text-align: center; margin: 30px 0;">
            <p style="color: #334155; font-size: 16px; margin-bottom: 20px;">Your verification code is:</p>
            <div style="background: #f1f5f9; padding: 20px; border-radius: 10px; display: inline-block;">
              <span style="font-size: 32px; font-weight: bold; color: #0ea5e9; letter-spacing: 5px;">${otp}</span>
            </div>
            <p style="color: #64748b; font-size: 14px; margin-top: 15px;">This code expires in 10 minutes</p>
          </div>
          
          <div style="background: #f8fafc; padding: 20px; border-radius: 10px; margin: 20px 0;">
            <p style="color: #475569; margin: 0; font-size: 14px;">
              <strong>What's next?</strong><br>
              • Discover communities with AI-powered search<br>
              • Join live conversation pods<br>
              • Connect with like-minded people
            </p>
          </div>
          
          <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p style="color: #94a3b8; font-size: 12px; margin: 0;">
              If you didn't request this, please ignore this email.
            </p>
          </div>
        </div>
      `
    };

    try {
      const { data, error } = await this.resend.emails.send(emailData);
      
      if (error) {
        console.error('❌ Resend error:', error);
        throw new Error(`Failed to send email: ${error.message}`);
      }
      
      console.log('✅ OTP email sent successfully to:', email, 'ID:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Email send error:', error);
      throw new Error('Failed to send verification email');
    }
  }
}

module.exports = new EmailService();