import axios from 'axios';

export const sendOtpViaSms = async (phoneNumber, message) => {
  const params = new URLSearchParams({
    method: "sendMessage",
    v: "1.1",
    auth_scheme: "plain",
    userid: process.env.GUPSHUP_USERID,
    password: process.env.GUPSHUP_PASSWORD,
    send_to: `91${phoneNumber}`,
    msg: message,
    msg_type: "text",
    format: "JSON"
  });

  const url = `${process.env.GUPSHUP_SMS_API}?${params.toString()}`;
  return axios.get(url);
};
