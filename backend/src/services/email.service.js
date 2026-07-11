const nodemailer = require('nodemailer');
const { google } = require('googleapis');
const dns = require('dns');

// Force Node.js to use IPv4 first when resolving domains to avoid ENETUNREACH IPv6 errors
dns.setDefaultResultOrder('ipv4first');

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  // If an App Password is provided, use the simpler basic auth approach
  if (process.env.GOOGLE_APP_PASSWORD) {
    return nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GOOGLE_USER,
        pass: process.env.GOOGLE_APP_PASSWORD,
      },
    });
  }

  // Fallback to the existing OAuth2 method
  const oauth2Client = new OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET,
    'https://developers.google.com/oauthplayground' // Redirect URL
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
  });

  const accessToken = await new Promise((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        console.error('Failed to create OAuth access token ->', err);
        reject(err);
      }
      resolve(token);
    });
  });

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      type: 'OAuth2',
      user: process.env.GOOGLE_USER,
      accessToken,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    },
  });

  return transporter;
};

// Expose a helper method for sending emails easily throughout the app
const sendEmail = async (emailOptions) => {
  try {
    const emailTransporter = await createTransporter();
    await emailTransporter.sendMail(emailOptions);
    console.log(`Email successfully sent to ${emailOptions.to}`);
  } catch (err) {
    console.error(`Error sending email`, err);
  }
};

module.exports = { sendEmail };
