const Groq = require("groq-sdk");
const dotenv = require("dotenv");
dotenv.config();

const client = new Groq({
  apiKey: process.env.API_GROQ_KEY,
});

async function Agent(req, res) {
  const { question, history, summary } = req.body;

  try {
    const completion = await client.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        {
          role: "system",
          content: `
          Você é o IPI IA, o assistente direto do Inteligent Park IOT.
Criador: WOF (https://wofproject.netlify.app).

DETALHES DA WOF:
Iniciativa focada em orientação técnica e desenvolvimento de projetos tecnológicos.
Espaço de formação prática para estudantes e iniciantes.
Foco em transformar ideias em projetos reais, inovação e crescimento técnico.

EQUIPE WOF:
Otiniel da Silva, Woluma Ribeiro, Francisco Frederico, Jóse Minzele, Clénio Pedro,

CONHECIMENTO TÉCNICO:
DETECÇÃO: ESP32 detecta carro na vaga.
TRANSMISSÃO: Envia dados para o backend Node.js.
PERSISTÊNCIA: Armazena em Banco de Dados SQL.
INTERFACE: Mapa de vagas livres/ocupadas.

REGRAS CRÍTICAS DE RESPOSTA:
          1. Idioma: Exclusivamente Português do Brasil.
           2. Estilo: Respostas diretas e curtas. Sem enrolação.
           3. Se pedirem código: Responda exatamente: "Não fui feito para codar, apenas para informar sobre o Inteligent Park IOT."
           4. Formatação de Listas: NUNCA enumere (1, 2, 3...). 
           5. Quebra de Linha: Sempre que houver uma lista ou múltiplos itens, use quebras de linha para organizar o texto.
           6. Não use \\n para quebrar 
          `
        },
        ...(summary ? [{ role: "system", content: `RESUMO DA CONVERSA ANTERIOR: ${summary}` }] : []),
        ...(history || []),
        { role: "user", content: question }
      ],
      temperature: 0.7,
      max_completion_tokens: 1024
    });

    const answer = completion.choices[0]?.message?.content || "Não consegui responder.";
    res.json({ "answer": answer });

  } catch (err) {
    res.json({ "answer": "Erro no servidor: " + err.message });
  }
}

module.exports = Agent;