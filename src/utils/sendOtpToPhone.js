const { default: axios } = require('axios');

async function sendOtpToPhone(phone, otp) {
  // Skip SMS sending if credentials are not configured
  if (!process.env.MSG91_AUTH_KEY || !process.env.MSG91_FLOW_ID) {
    console.log(`[DEV MODE] OTP for ${phone}: ${otp}`);
    return { success: true, mode: 'dev' };
  }

  try {
    const response = await axios({
      method: 'POST',
      url: 'https://api.msg91.com/api/v5/flow/',
      headers: {
        authkey: process.env.MSG91_AUTH_KEY,
        'Content-Type': 'application/json',
      },
      data: {
        flow_id: process.env.MSG91_FLOW_ID,
        mobiles: `91${phone}`,
        otp: String(otp),
      },
    });
    console.log('SMS sent successfully:', response.data);
    return { success: true, data: response.data };
  } catch (error) {
    console.error('Failed to send SMS:', error.message);
    throw new Error('Failed to send OTP via SMS');
  }
}

module.exports = sendOtpToPhone;
