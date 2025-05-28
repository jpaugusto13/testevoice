require("dotenv").config();
const express = require("express");
const {
  twiml: { VoiceResponse },
} = require("twilio");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 3000;
const VOICES_DIR = path.join(__dirname, "voices");
const WELCOME_FILE = path.join(VOICES_DIR, "bemvindo.mp3");

// ID da voz que você passou
const ELEVEN_VOICE_ID = "cNYrMw9glwJZXR8RwbuR";
// Texto de boas-vindas
const WELCOME_TEXT =
  "Olá! Aqui é da Wiiprint Sublimações. Seja muito bem-vindo!";
// Endpoint da ElevenLabs
const ELEVEN_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`;

// 1) Garante que a pasta existe
if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR);
}

// 2) Se ainda não existir o MP3, gera usando a ElevenLabs
async function generateWelcomeAudio() {
  if (fs.existsSync(WELCOME_FILE)) {
    console.log("🔊 Áudio de boas-vindas já existe.");
    return;
  }
  console.log("🔊 Gerando áudio de boas-vindas na ElevenLabs...");
  try {
    const resp = await axios({
      method: "post",
      url: ELEVEN_URL,
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": process.env.ELEVENLABS_API_KEY,
      },
      data: {
        text: WELCOME_TEXT,
        voice_settings: {
          stability: 0.75,
          similarity_boost: 0.75,
        },
      },
      responseType: "stream",
    });

    const writer = fs.createWriteStream(WELCOME_FILE);
    resp.data.pipe(writer);
    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });
    console.log("✅ MP3 de bem-vindo gerado em voices/bemvindo.mp3");
  } catch (err) {
    console.error("❌ Falha ao gerar áudio ElevenLabs:", err.message);
  }
}

// Chama no startup
generateWelcomeAudio();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve a pasta voices
app.use("/voices", express.static(VOICES_DIR));

// Handler único para GET e POST em /voice
function voiceHandler(req, res) {
  const response = new VoiceResponse();
  // Constrói a URL absoluta para o MP3
  const audioUrl = `${req.protocol}://${req.get("host")}/voices/bemvindo.mp3`;
  response.play(audioUrl);
  res.type("text/xml");
  res.send(response.toString());
}

app.get("/voice", voiceHandler);
app.post("/voice", voiceHandler);

// Rota saúde
app.get("/", (req, res) => res.send("✅ API da Wiiprint Rodando!"));

app.listen(PORT, () => console.log(`🚀 Servidor rodando na porta ${PORT}`));
