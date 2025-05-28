require("dotenv").config();
const express = require("express");
const { twiml } = require("twilio");
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const app = express();
const PORT = process.env.PORT || 8080;

// Serve a pasta de áudios
app.use("/voices", express.static(path.join(__dirname, "voices")));

// Rotas

// 📞 Rota inicial da chamada
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();

  // Toca um áudio inicial
  response.play(`https://testevoice.onrender.com/voices/bemvindo.mp3`);

  // Abre um gather pra escutar o cliente
  const gather = response.gather({
    input: "speech",
    action: "/processar",
    method: "POST",
    speechTimeout: "auto",
  });

  gather.say(
    "Seja bem-vindo à Wiiprint Sublimações. Pode falar, estou te ouvindo."
  );

  res.type("text/xml");
  res.send(response.toString());
});

// 🔄 Processa o que o cliente falou e responde
app.post("/processar", async (req, res) => {
  const response = new twiml.VoiceResponse();

  const gather = response.gather({
    input: "speech",
    action: "/processar",
    method: "POST",
    speechTimeout: "auto",
  });

  gather.say("Desculpe, não entendi. Pode repetir, por favor.");

  res.type("text/xml");
  res.send(response.toString());
});

// 🔊 Teste de áudio (rota opcional)
app.get("/", (req, res) => {
  res.send("API da Wiiprint Rodando!");
});

// 🚀 Start
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
