require("dotenv").config();
const express = require("express");
const axios = require("axios");
const fs = require("fs");
const { twiml } = require("twilio");
const app = express();

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ✅ Serve a pasta voices
app.use("/voices", express.static("voices"));

// ✅ Cria a pasta voices se não existir
if (!fs.existsSync("./voices")) {
  fs.mkdirSync("./voices");
  console.log("📁 Pasta voices criada");
}

// 🔑 Keys
const openaiKey = process.env.OPENAI_API_KEY;
const elevenLabsKey = process.env.ELEVENLABS_API_KEY;
const voiceId = "EXAVITQu4vr4xnSDxMaL"; // 🔥 ID da voz escolhida na ElevenLabs

// 🔥 Prompt base da Wiiprint
const promptBase = `
Você é um atendente da Wiiprint Sublimações, uma empresa especializada em sublimação de tecidos, painéis de festa, estampas e fardamentos personalizados.

Se apresente sempre assim no início da conversa:
"Olá, aqui é da Wiiprint Sublimações! Somos especialistas em sublimação de tecidos, painéis personalizados para festas e confecção de fardamentos. Pode me perguntar qualquer coisa que eu te ajudo."

Informações sobre a Wiiprint:
- Trabalhamos com sublimação de tecidos como Helanca, Tactel, Suede e outros materiais para festas e confecção.
- Fazemos painéis personalizados sob medida.
- Criamos estampas exclusivas para fardamento.
- Atendemos tanto decoradores, lojistas, quanto clientes finais.
- Enviamos para todo o Brasil.
- Prezamos por qualidade, rapidez na entrega e atendimento personalizado.
- Oferecemos catálogos, amostras e orientação na escolha dos materiais.

Seja simpático, educado e responda de forma clara e objetiva.
Mantenha sempre um tom agradável, como se fosse um atendente real, humano.

Quando o cliente perguntar sobre qualquer serviço, explique com detalhes, sugira opções e sempre pergunte:
“Posso te ajudar com mais alguma coisa?”

Você deve se comportar como um especialista na empresa, capaz de responder dúvidas sobre produtos, prazos, formas de pagamento, envios, materiais e diferenciais.

Se em algum momento não souber a resposta, diga:
"Essa é uma ótima pergunta! Vou encaminhar para nosso time de atendimento te responder direitinho."
`;

// 🧠 Função de gerar resposta da OpenAI
async function gerarResposta(pergunta) {
  try {
    const res = await axios.post(
      "https://api.openai.com/v1/chat/completions",
      {
        model: "gpt-4o",
        messages: [
          { role: "system", content: promptBase },
          { role: "user", content: pergunta },
        ],
        temperature: 0.7,
      },
      {
        headers: {
          Authorization: `Bearer ${openaiKey}`,
          "Content-Type": "application/json",
        },
      }
    );
    return res.data.choices[0].message.content.trim();
  } catch (error) {
    console.error(
      "❌ Erro OpenAI:",
      error.response ? error.response.data : error.message
    );
    return "Desculpe, houve um erro ao gerar a resposta.";
  }
}

// 🎙️ Função de gerar áudio com ElevenLabs
async function gerarAudio(texto) {
  try {
    const response = await axios.post(
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
    );

    const filePath = `voices/audio-${Date.now()}.mp3`;
    fs.writeFileSync(filePath, response.data);
    console.log("✅ Áudio gerado:", filePath);
    return filePath;
  } catch (error) {
    console.error(
      "❌ Erro ElevenLabs:",
      error.response ? error.response.data : error.message
    );
    return null;
  }
}

// 🔔 Endpoint inicial da ligação
app.post("/voice", async (req, res) => {
  const twimlResponse = new twiml.VoiceResponse();

  const resposta = await gerarResposta(
    "Se apresente como atendente da Wiiprint Sublimações e explique o que fazemos."
  );
  const audioPath = await gerarAudio(resposta);

  if (!audioPath) {
    twimlResponse.say(
      { voice: "Polly.Brazilian.Portuguese.Fabio", language: "pt-BR" },
      "Desculpe, ocorreu um erro ao gerar o áudio. Por favor, tente novamente."
    );
  } else {
    const gather = twimlResponse.gather({
      input: "speech",
      action: "/processar",
      method: "POST",
      speechTimeout: "auto",
    });

    gather.play(
      `https://hideously-elegant-tortoise.ngrok-free.app/${audioPath}`
    );
  }

  res.type("text/xml");
  res.send(twimlResponse.toString());
});

// 🔄 Processamento da conversa
app.post("/processar", async (req, res) => {
  const twimlResponse = new twiml.VoiceResponse();
  const speechResult = req.body.SpeechResult || "Não entendi";

  const prompt = `O cliente falou: "${speechResult}". Responda como atendente da Wiiprint.`;

  const resposta = await gerarResposta(prompt);
  const audioPath = await gerarAudio(resposta);

  if (!audioPath) {
    twimlResponse.say(
      { voice: "Polly.Brazilian.Portuguese.Fabio", language: "pt-BR" },
      "Desculpe, ocorreu um erro ao gerar o áudio. Por favor, tente novamente."
    );
  } else {
    const gather = twimlResponse.gather({
      input: "speech",
      action: "/processar",
      method: "POST",
      speechTimeout: "auto",
    });

    gather.play(`https://${req.hostname}/${audioPath}`);
  }

  res.type("text/xml");
  res.send(twimlResponse.toString());
});

// 🚀 Inicializa o servidor
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
