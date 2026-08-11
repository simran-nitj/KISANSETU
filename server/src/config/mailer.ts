import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.ethereal.email',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
    pass: process.env.SMTP_PASS || 'ethereal_password',
  },
});

/**
 * Send an email notification.
 * Falls back to console logs in development if credentials aren't set.
 */
export const sendEmail = async (
  to: string,
  subject: string,
  html: string
): Promise<boolean> => {
  try {
    const from = process.env.EMAIL_FROM || 'KisanSetu Admin <noreply@kisansetu.com>';
    
    // Check if nodemailer auth details are mock/empty
    if (!process.env.SMTP_USER || process.env.SMTP_USER.includes('ethereal')) {
      console.log(`[Email Mock Service] to: ${to} | subject: ${subject}`);
      return true;
    }

    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('Email dispatch failed:', error);
    return false;
  }
};

export default transporter;
