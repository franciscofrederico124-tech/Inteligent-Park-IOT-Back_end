const express = require('express');
const session = require('express-session');
const cors = require('cors');
const path = require('path');
const bcrypt = require("bcryptjs");
require("dotenv").config();

const db = require("./src/config/postgresql");

const app = express();

const Agent = require("./src/routes/agent");
const ContextExtractor = require("./src/routes/contex");


// --- MIDDLEWARES ---
app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

app.use(express.static(
  path.join(__dirname, 'public')
));

app.use(cors( {
  origin: "*",
  credentials: true
}));


// --- SESSION ---
app.use(session( {
  secret: process.env.SESSION_SECRET || "secret",

  resave: false,

  saveUninitialized: false,

  cookie: {
    httpOnly: true,
    secure: false,
    maxAge: 1000 * 60 * 60
  }
}));


// --- DADOS TEMPORÁRIOS ---
let user = null;

let parkData = {
  free: 3,
  ocupped: 0,
  total: 3
};


// --- VALIDAÇÃO ---
function Validate(el) {
  return el && el.trim() !== "";
}


// --- LOGIN ---
app.post("/auth/login", async (req, res) => {

  const {
    email,
    password
  } = req.body;

  try {

    if (
      !Validate(email) ||
      !Validate(password)
    ) {

      return res.status(400).json({
        success: false,
        message: "Email e senha obrigatórios!"
      });

    }

    const result = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    const row = result.rows[0];

    if (!row) {

      return res.status(401).json({
        success: false,
        message: "Usuário não encontrado!"
      });

    }

    const passwordMatch = await bcrypt.compare(
      password,
      row.password
    );

    if (!passwordMatch) {

      return res.status(401).json({
        success: false,
        message: "Senha incorreta!"
      });

    }

    user = {
      id: row.id,
      name: row.name,
      email: row.email
    };

    return res.json({
      success: true,
      message: "Sessão iniciada!",
      user
    });

  } catch (e) {

    console.log(e);

    return res.status(500).json({
      success: false,
      message: "Erro interno!"
    });

  }

});


// --- REGISTER ---
app.post("/auth/register", async (req, res) => {

  const {
    name,
    email,
    password
  } = req.body;

  try {

    if (
      !name ||
      !email ||
      !password
    ) {

      return res.status(400).json({
        success: false,
        message: "Todos campos obrigatórios!"
      });

    }

    const checkUser = await db.query(
      "SELECT * FROM users WHERE email = $1",
      [email]
    );

    if (checkUser.rows.length > 0) {

      return res.status(400).json({
        success: false,
        message: "Email já existe!"
      });

    }

    const hash = await bcrypt.hash(
      password,
      10
    );

    const result = await db.query(
      `
      INSERT INTO users(
      name,
      email,
      password
      )

      VALUES($1, $2, $3)

      RETURNING id
      `,
      [name, email, hash]
    );

    return res.json({
      success: true,
      message: "Conta criada!",

      user: {
        id: result.rows[0].id,
        name,
        email
      }
    });

  } catch (e) {

    console.log(e);

    return res.status(500).json({
      success: false,
      message: "Erro interno!"
    });

  }

});


// --- CHECK SESSION ---
app.get("/auth/check", (req, res) => {

  if (user) {

    return res.json({
      success: true,
      message: "Sessão activa",
      user
    });

  }

  return res.json({
    success: false,
    message: "Nenhuma sessão",
    user: null
  });

});


// --- LOGOUT ---
app.post("/auth/logout", (req, res) => {

  try {

    user = null;

    return res.json({
      success: true,
      message: "Sessão terminada!"
    });

  } catch (e) {

    console.log(e);

    return res.status(500).json({
      success: false,
      message: e.message
    });

  }

});


// --- IA ---
app.post(
  "/assitent/ask",
  Agent
);

app.post(
  "/assitent/assistent/ask/context",
  ContextExtractor
);


// --- RECEBER DADOS ESP32 ---
app.post("/park/data/receiv", (req, res) => {

  const {
    data
  } = req.body;

  console.log(
    "Dados recebidos:",
    req.body
  );

  if (data) {

    parkData = {
      free: data.free,
      ocupped: data.ocupped,
      total: data.total
    };

    return res.status(200).json({
      success: true,
      message: "Dados recebidos!"
    });

  }

  return res.status(400).json({
    success: false,
    message: "Dados inválidos!"
  });

});


// --- ENVIAR DADOS FRONTEND ---
app.post("/park/data/send", (req, res) => {

  return res.json(parkData);

});


// --- SERVER ---
const PORT =
process.env.PORT || 3000;

app.listen(PORT, () => {

  console.log(`
  > ----------------------------
  > 🚀 Servidor iniciado!
  >
  > http://localhost:${PORT}
  > -------------------------------
    `);

});