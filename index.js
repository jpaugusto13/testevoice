const { twiml } = require("twilio");
const express = require("express");
const app = express();
const path = require("path");

app.use("/voices", express.static(path.join(__dirname, "voices")));

app.post("/voice", (req, res) => {
  const response = new twiml.VoiceResponse();

  response.say("Olá, bem-vindo à Wiiprint. Esta é uma chamada de teste.");

  res.type("text/xml");
  res.send(response.toString());
});

app.post("/processar", (req, res) => {
  const response = new twiml.VoiceResponse();

  const gather = response.gather({
    input: "speech",
    action: "/processar",
    method: "POST",
    speechTimeout: "auto",
  });

  gather.say("Pode falar, estou te ouvindo!");

  res.type("text/xml");
  res.send(response.toString());
});

app.listen(8082, () => {
  console.log("🚀 Servidor rodando na porta 8082");
});
