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

// IDs e URLs da ElevenLabs
const ELEVEN_API_KEY = process.env.ELEVENLABS_API_KEY;
const ELEVEN_VOICE_ID = "cNYrMw9glwJZXR8RwbuR";
const ELEVEN_TTS_URL = `https://api.elevenlabs.io/v1/text-to-speech/${ELEVEN_VOICE_ID}`;

// Pasta e arquivo de áudio
const VOICES_DIR = path.join(__dirname, "voices");
const WELCOME_MP3 = path.join(VOICES_DIR, "bemvindo.mp3");

// Texto que será sintetizado
const WELCOME_TEXT =
  "Olá! Aqui é da Wiiprint Sublimações. Seja muito bem-vindo!";

// 1) Garante existência da pasta
if (!fs.existsSync(VOICES_DIR)) {
  fs.mkdirSync(VOICES_DIR);
}

// 2) Gera o MP3 na primeira vez
async function ensureWelcomeAudio() {
  if (fs.existsSync(WELCOME_MP3)) return;
  try {
    console.log("🔊 Gerando áudio de boas-vindas na ElevenLabs...");
    const resp = await axios({
      method: "POST",
      url: ELEVEN_TTS_URL,
      headers: {
        "Content-Type": "application/json",
        "xi-api-key": ELEVEN_API_KEY,
      },
      data: {
        text: WELCOME_TEXT,
        voice_settings: { stability: 0.7, similarity_boost: 0.7 },
      },
      responseType: "stream",
    });
    const writer = fs.createWriteStream(WELCOME_MP3);
    resp.data.pipe(writer);
    await new Promise((res, rej) => {
      writer.on("finish", res);
      writer.on("error", rej);
    });
    console.log("✅ Áudio gerado em voices/bemvindo.mp3");
  } catch (err) {
    console.error("❌ Erro gerando áudio:", err.message);
  }
}
ensureWelcomeAudio();

// Middleware
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve o MP3
app.use("/voices", express.static(VOICES_DIR));

// Handler único para /voice (GET e POST)
function voiceHandler(req, res) {
  const response = new VoiceResponse();
  const audioUrl = `${req.protocol}://${req.get("host")}/voices/bemvindo.mp3`;
  response.play(audioUrl);
  res.type("text/xml");
  res.send(response.toString());
}
app.get("/voice", voiceHandler);
app.post("/voice", voiceHandler);

// Rota de health-check
app.get("/", (req, res) => res.send("✅ API da Wiiprint Rodando!"));

app.listen(PORT, () => {
  console.log(`🚀 Server rodando na porta ${PORT}`);
});
