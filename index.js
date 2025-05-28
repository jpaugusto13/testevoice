require("dotenv").config();
const express = require("express");
const { twiml } = require("twilio");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

// Middleware para aceitar POST corretamente
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve a pasta de áudios
app.use("/voices", express.static(path.join(__dirname, "voices")));

// 📞 Rota inicial da chamada
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();

  const gather = response.gather({
    input: "speech",
    action: "/processar",
    method: "POST",
    speechTimeout: "auto",
  });

  // DENTRO do gather: opcional, se o .mp3 estiver funcionando bem
  // gather.play("https://testevoice.onrender.com/voices/bemvindo.mp3");

  // Diga a mensagem inicial
  gather.say(
    "Olá! Aqui é da Wiiprint Sublimações. Pode falar, estou te ouvindo."
  );

  res.type("text/xml");
  res.send(response.toString());
});

// 🔄 Processa o que o cliente falou e responde
app.post("/processar", (req, res) => {
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

// Teste da API
app.get("/", (req, res) => {
  res.send("✅ API da Wiiprint Rodando!");
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
