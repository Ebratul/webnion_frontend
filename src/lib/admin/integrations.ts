// Email & Storage: the email server and Cloudinary, as the API reports them. Passwords never come back, only their last
// four characters. `source` says where the settings in use come from: this screen, the server's .env, or nowhere.
export type SettingSource = 'admin' | 'env' | 'none';

export interface MailSettings {
  source: SettingSource;
  host: string;
  port: number;
  user: string;
  fromName: string;
  fromEmail: string;
  // The From line set in .env, while that is what is used
  envFrom?: string;
  hasPassword: boolean;
  passwordHint: string;
  passwordUnreadable: boolean;
}

export interface MediaSettings {
  source: SettingSource;
  // Where uploads go now
  target: 'cloudinary' | 'blob' | 'disk' | 'none';
  cloudName: string;
  apiKeyHint: string;
  folder: string;
  hasSecret: boolean;
  secretHint: string;
  secretUnreadable: boolean;
}

export interface IntegrationsData {
  mail: MailSettings;
  media: MediaSettings;
  canEncrypt: boolean;
}

// Common providers, so the owner does not have to look up the server name and port
export const MAIL_PRESETS = [
  { label: 'Gmail', host: 'smtp.gmail.com', port: 587, note: 'Use an App Password from your Google account (Security → 2-Step Verification → App passwords), not your normal password.' },
  { label: 'Zoho Mail', host: 'smtp.zoho.com', port: 465, note: 'Use your Zoho email and password, or an app-specific password if two-factor sign-in is on.' },
  { label: 'Outlook', host: 'smtp-mail.outlook.com', port: 587, note: 'Use your Outlook email and password, or an app password if two-step verification is on.' },
  { label: 'Brevo', host: 'smtp-relay.brevo.com', port: 587, note: 'Use the SMTP login and key from Brevo → SMTP & API.' },
  { label: 'Resend', host: 'smtp.resend.com', port: 465, note: 'User name is "resend"; the password is your Resend API key.' },
] as const;
