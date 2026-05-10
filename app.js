const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const db = require("./src/config/sqlite3");
const app = express()

const Agent = require("./src/routes/agent");
const ContextExtractor = require("./src/routes/contex");


// --- MIDDLEWARES ---
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));


app.use(cors({
  origin: "*", // ajuste para a porta do seu frontend
  credentials: true
}));

// ⚠️ Configuração correta da sessão
app.use(session({
  secret: '******', // troque por um segredo forte
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: false, // true apenas em produção com HTTPS
    maxAge: 1000 * 60 * 60 // 1 hora
  }
}));

let user = null;
let parkData = {
  "free": 3,
  "ocupped": 0,
  "total": 0
}

// --- FUNÇÃO DE VALIDAÇÃO ---
function Validate(el) {
  return el && el.trim() !== "";
}

// --- LOGIN ---
app.post("/auth/login", (req, res) => {
  const { email, password } = req.body;

  console.log("Tentando login:", req.body);

  if (!Validate(email) || !Validate(password)) {
    return res.status(400).json({ success: false, message: "Email e senha são obrigatórios!" });
  }

  const sql = "SELECT * FROM users WHERE email = ? AND password = ?";
  db.get(sql, [email, password], (err, row) => {
    if (err) {
      console.error("Erro no banco:", err);
      return res.status(500).json({ success: false, message: "Erro interno" });
    }

    if (row) {
      console.log("Sessão iniciada ✅");

      user = { id: row.id, name: row.name, email: row.email };

      console.log("Sessão salva:", req.session.user);

      return res.json({
        success: true,
        message: "Sessão iniciada com sucesso!",
        user: user,
      });
    } else {
      console.log("Credenciais inválidas ❌");
      return res.status(401).json({ success: false, message: "Email ou senha incorretos" });
    }
  });
});

// --- REGISTRO ---
app.post("/auth/register", (req, res) => {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: "Todos os campos são obrigatórios!" });
  }

  console.log(`Tentando criar conta para: ${email}`);

  const checkUserSql = "SELECT * FROM users WHERE email = ?";
  db.get(checkUserSql, [email], (err, row) => {
    if (err) {
      console.error("Erro na busca:", err);
      return res.status(500).json({ success: false, message: "Erro no banco de dados" });
    }

    if (row) {
      return res.status(400).json({ success: false, message: "Este e-mail já está em uso!" });
    }

    const insertSql = "INSERT INTO users (name, email, password) VALUES (?, ?, ?)";
    db.run(insertSql, [name, email, password], function (err) {
      if (err) {
        console.error("Erro ao inserir:", err);
        return res.status(500).json({ success: false, message: "Erro ao salvar usuário" });
      }

      console.log(`Usuário criado com ID: ${this.lastID}`);

      return res.json({
        success: true,
        message: "Conta criada!",
        user: { name, email, userId: this.lastID },
      });
    });
  });
});

// --- CHECK SESSION ---
app.get("/auth/check/", (req, res) => {
  console.log("Verificando sessão...");
  console.log("Sessão atual:", user);

  if (user) {
    return res.json({
      success: true,
      message: "Sessão iniciada",
      user: user,
    });
  } else {
    return res.json({
      success: false,
      message: "Nenhuma sessão ativa",
      user: null,
    });
  }
});

// --- LOGOUT ---
app.post("/auth/logout", (req, res) => {
  try {
    console.log("Sessão termininada! ");

    user = null;
    return res.json({
      session: true,
      message: "Sessão terminada! "
    })
  }
  catch (e) {

    console.log("Errro no sistema", e);
    return res.json({
      success: false,
      message: `erro: ${e.message}`,
    })
  }
});

app.post("/assitent/ask", Agent);
app.post("/assitent/assistent/ask/context", ContextExtractor);


// --- ROTA DE RECEBIMENTO (VEM DO ESP32) ---
app.post("/park/data/receiv", (req, res) => {
  const { data } = req.body;

  console.log("Dados brutos recebidos do ESP32:", req.body);

  if (data) {

    parkData = {
      free: data.free,
      ocupped: data.ocupped,
      total: data.total
    };

    console.log("Dados recebidos do esp32:", parkData);

    return res.status(200).json({ success: true, message: "Dados recebidos" });
  } else {
    console.log("Dados não encontrados no corpo da requisição ❌");
    return res.status(400).json({ success: false, message: "Estrutura de dados inválida" });
  }
});


app.post("/park/data/send", (req, res) => {
 
  if (parkData && typeof parkData.free !== 'undefined') {
    console.log("Enviando parkData para o Frontend:", parkData);
    return res.json(parkData);
  } else {
    console.log("Dados de estacionamento ainda não disponíveis.");
    return res.json({
      "free": 0,
      "ocupped": 0,
      "total": 3
    });
  }
});


// --- SERVER ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT} \n http://localhost:${PORT}`);
});
