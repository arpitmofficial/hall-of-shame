const twilio = require('twilio');

// Initialize only if keys are present to prevent crashes if .env isn't set up yet
const client = (process.env.TWILIO_ACCOUNT_SID && process.env.TWILIO_AUTH_TOKEN)
  ? twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)
  : null;

const sendSMS = async (toPhone, message) => {
  if (!client || !process.env.TWILIO_PHONE_NUMBER) {
    console.log(`[SMS MOCK] To: ${toPhone} | Message: ${message}`);
    return false; // Return false so we know it was mocked
  }

  // Twilio requires E.164 format (e.g. +919876543210 or +1234567890)
  // We'll try to ensure there's a + sign, assuming users entered country code.
  // If not, it might fail depending on Twilio's strictness, but we'll prepend + if missing.
  let formattedPhone = toPhone.toString().trim();
  if (!formattedPhone.startsWith('+')) {
    // Defaulting to India (+91) if no plus is provided - adjust this if you are elsewhere!
    formattedPhone = `+91${formattedPhone}`; 
  }

  try {
    const res = await client.messages.create({
      body: message,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: formattedPhone,
    });
    console.log(`[SMS SENT] SID: ${res.sid} to ${formattedPhone}`);
    return true;
  } catch (error) {
    console.error(`[SMS ERROR] Failed to send to ${formattedPhone}:`, error.message);
    return false;
  }
};

module.exports = { sendSMS };
