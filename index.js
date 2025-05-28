require("dotenv").config();
const axios = require("axios");
const fs = require("fs");

// 🗣️ Configurações
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
const voiceId = "EXAVITQu4vr4xnSDxMaL"; // ID da voz ElevenLabs

// 📁 Garante que a pasta voices exista
if (!fs.existsSync("./voices")) {
  fs.mkdirSync("./voices");
  console.log("📁 Pasta voices criada");
}

// 📝 Texto que será convertido em voz
const texto =
  "Olá! Seja bem-vindo à Wiiprint Sublimações. Trabalhamos com sublimação de tecidos, painéis de festa e fardamentos personalizados.";

// 🚀 Faz a requisição para ElevenLabs
axios
  .post(
    `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`,
    {
      text: texto,
      voice_settings: {
        stability: 0.7,
        similarity_boost: 0.7,
      },
    },
    {
      headers: {
        "xi-api-key": elevenLabsKey,
        "Content-Type": "application/json",
        Accept: "audio/mpeg",
      },
      responseType: "arraybuffer",
    }
  )
  .then((response) => {
    const filePath = `voices/audio-${Date.now()}.mp3`;
    fs.writeFileSync(filePath, response.data);
    console.log("✅ Áudio salvo em", filePath);
  })
  .catch((error) => {
    console.error(
      "❌ Erro ao gerar áudio:",
      error.response ? error.response.data : error.message
    );
  });
