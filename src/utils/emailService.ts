import nodemailer from 'nodemailer';
import { config } from '../config';

interface EmailOptions {
  to: string;
  subject: string;
  text: string;
  html?: string;
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_FROM,
    pass: process.env.EMAIL_PASS
  }
});

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      text: options.text,
      html: options.html
    });
  } catch (error) {
    console.error('Error sending email:', error);
    throw new Error('Failed to send email');
  }
};

export const sendResetPasswordEmail = async (email: string, token: string): Promise<void> => {
  const resetUrl = `http://localhost:3000/reset-password?token=${token}`;
  
  const emailOptions: EmailOptions = {
    to: email,
    subject: 'Recuperação de Senha - Academia',
    text: `Para redefinir sua senha, clique no link: ${resetUrl}`,
    html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: #e53e3e;">Recuperação de Senha</h2>
        <p>Você solicitou a redefinição de sua senha.</p>
        <p>Clique no botão abaixo para criar uma nova senha:</p>
        <a href="${resetUrl}" 
           style="display: inline-block; 
                  background: #e53e3e; 
                  color: white; 
                  padding: 12px 24px; 
                  text-decoration: none; 
                  border-radius: 5px;
                  margin: 20px 0;">
          Redefinir Senha
        </a>
        <p style="color: #666; font-size: 14px;">
          Se você não solicitou esta redefinição, ignore este email.
        </p>
        <p style="color: #666; font-size: 14px;">
          Este link expira em 1 hora.
        </p>
      </div>
    `
  };

  await sendEmail(emailOptions);
};
