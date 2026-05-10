const Groq = require("groq-sdk");
const dotenv = require("dotenv");

dotenv.config();

const client = new Groq({ apiKey: process.env.API_GROQ_KEY });

async function ContextExtractor(req, res) {
  const { historyToCompress } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.1-8b-instant", // Modelo rápido e barato para resumir
      messages: [
        { 
          role: "system", 
          content: "Resuma as interações abaixo em no máximo 3 frases, mantendo apenas fatos essenciais e o contexto sobre o Inteligent Park IOT. Ignore saudações." 
        },
        { role: "user", content: JSON.stringify(historyToCompress) }
      ],
      temperature: 0.1, // Quase zero para não inventar nada
      max_completion_tokens: 200
    });

    const summary = completion.choices[0]?.message?.content || "";
    res.json({ summary });
  } catch (err) {
    res.json({ summary: "Contexto anterior não disponível." });
  }
}

module.exports = ContextExtractor;