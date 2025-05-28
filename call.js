require("dotenv").config();
const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const YOUR_PHONE_NUMBER = "+5585988849894";

client.calls
  .create({
    url: "https://hideously-elegant-tortoise.ngrok-free.app/voice", // Seu ngrok
    to: YOUR_PHONE_NUMBER,
    from: process.env.TWILIO_PHONE_NUMBER,
  })
  .then((call) => console.log(`✅ Ligação iniciada! SID: ${call.sid}`))
  .catch((err) => console.error("❌ Erro:", err));
