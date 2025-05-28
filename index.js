require("dotenv").config();
const express = require("express");
const { twiml } = require("twilio");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 8080;

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// Serve a pasta de áudios (opcional, se for usar futuramente)
app.use("/voices", express.static(path.join(__dirname, "voices")));

// 📞 Rota de chamada — só fala a mensagem de boas-vindas
app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();

  response.say("Olá! Aqui é da Wiiprint Sublimações. Seja muito bem-vindo!");

  res.type("text/xml");
  res.send(response.toString());
});

// Rota de teste no navegador
app.get("/", (req, res) => {
  res.send("✅ API da Wiiprint Rodando!");
});

// Start do servidor
app.listen(PORT, () => {
  console.log(`🚀 Servidor rodando na porta ${PORT}`);
});
