require("dotenv").config();
const express = require("express");
const {
  twiml: { VoiceResponse },
} = require("twilio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Para que Twilio possa chamar via GET ou POST
const voiceHandler = (req, res) => {
  const response = new VoiceResponse();
  response.say("Olá! Aqui é da Wiiprint Sublimações. Seja muito bem-vindo!");
  res.type("text/xml");
  res.send(response.toString());
};

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Rotas GET e POST para /voice
app.get("/voice", voiceHandler);
app.post("/voice", voiceHandler);

// Rota teste
app.get("/", (req, res) => {
  res.send("✅ API da Wiiprint Rodando! IHUUUUU");
});

app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
