import { contact } from '../data/portfolioData';

const emailjsConfig = contact.emailjs;

export const EMAILJS_CONFIG = {
  SERVICE_ID: import.meta.env.VITE_EMAILJS_SERVICE_ID || emailjsConfig.SERVICE_ID,
  TEMPLATE_ID: import.meta.env.VITE_EMAILJS_TEMPLATE_ID || emailjsConfig.TEMPLATE_ID,
  PUBLIC_KEY: import.meta.env.VITE_EMAILJS_PUBLIC_KEY || emailjsConfig.PUBLIC_KEY,
};

export const sendEmail = async (formData) => {
  const emailjs = await import('@emailjs/browser');

  const templateParams = {
    from_name: formData.get('from_name'),
    from_email: formData.get('from_email'),
    subject: formData.get('subject'),
    message: formData.get('message'),
  };

  return emailjs.send(
    EMAILJS_CONFIG.SERVICE_ID,
    EMAILJS_CONFIG.TEMPLATE_ID,
    templateParams,
    { publicKey: EMAILJS_CONFIG.PUBLIC_KEY }
  );
};
